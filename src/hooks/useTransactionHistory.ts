import { useState, useEffect } from 'react';
import { UNCFormData } from '@/hooks/useUNCForm';
import { isApiAvailable, apiFetch } from '@/lib/api';

export interface TransactionRecord {
  id: string;
  date: string;
  savedAt: string;
  formData: UNCFormData;
}

const STORAGE_KEY = 'unc-history';

const EMPTY_FORM_DATA: UNCFormData = {
  date: '',
  payerName: '',
  payerAddress: '',
  payerAccount: '',
  payerBank: '',
  amount: '',
  amountWords: '',
  exchangeTo: '',
  exchangeRate: '',
  feeType: '',
  beneficiaryName: '',
  beneficiaryCCCD: '',
  cccdDate: '',
  cccdPlace: '',
  beneficiaryAddress: '',
  beneficiaryAccount: '',
  beneficiaryBank: '',
  remarks: '',
};

type LegacyTransactionRecord = Partial<TransactionRecord> & {
  timestamp?: string;
  data?: Partial<UNCFormData>;
} & Partial<UNCFormData>;

const isFeeType = (value: unknown): value is UNCFormData['feeType'] =>
  value === '' || value === 'deduct' || value === 'cash' || value === 'account';

function normalizeRecord(record: LegacyTransactionRecord): TransactionRecord {
  const sourceData = (record.formData ?? record.data ?? record) as Partial<UNCFormData>;
  const feeType = isFeeType(sourceData.feeType) ? sourceData.feeType : '';

  const formData: UNCFormData = {
    ...EMPTY_FORM_DATA,
    ...sourceData,
    feeType,
  };

  return {
    id: record.id || crypto.randomUUID(),
    date: record.date || formData.date,
    savedAt: record.savedAt || record.timestamp || '',
    formData,
  };
}

function loadLocal(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is LegacyTransactionRecord => !!item && typeof item === 'object')
      .map(normalizeRecord);
  } catch {
    return [];
  }
}

export function useTransactionHistory() {
  const [history, setHistory] = useState<TransactionRecord[]>(loadLocal);
  const [useApi, setUseApi] = useState(false);

  // Kiểm tra API và tải dữ liệu từ server
  useEffect(() => {
    isApiAvailable().then(async (available) => {
      setUseApi(available);
      if (available) {
        try {
          const data = await apiFetch<TransactionRecord[]>('/api/transactions');
          setHistory(data);
        } catch (err) {
          console.warn('Không thể tải lịch sử từ server, dùng localStorage:', err);
          setHistory(loadLocal());
        }
      }
    });
  }, []);

  // Lưu localStorage khi không có API
  useEffect(() => {
    if (!useApi) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, useApi]);

  const saveTransaction = async (formData: UNCFormData) => {
    if (!formData.beneficiaryAccount || !formData.amount) return;

    // Kiểm tra trùng lặp
    if (history.length > 0) {
      const last = history[0].formData;
      const isDuplicate = 
        last.date === formData.date &&
        last.payerAccount === formData.payerAccount &&
        last.payerName === formData.payerName &&
        last.beneficiaryAccount === formData.beneficiaryAccount &&
        last.beneficiaryName === formData.beneficiaryName &&
        last.beneficiaryBank === formData.beneficiaryBank &&
        last.amount === formData.amount &&
        last.remarks === formData.remarks;
      if (isDuplicate) {
        console.log("UNC trùng lặp với giao dịch vừa thực hiện, không lưu.");
        return;
      }
    }

    if (useApi) {
      try {
        const result = await apiFetch<{ id: string; savedAt: string }>('/api/transactions', {
          method: 'POST',
          body: JSON.stringify({ formData }),
        });
        const record: TransactionRecord = {
          id: result.id,
          date: formData.date,
          savedAt: result.savedAt,
          formData: { ...formData },
        };
        setHistory(prev => [record, ...prev]);
      } catch (err) {
        console.error('Lỗi lưu giao dịch:', err);
      }
    } else {
      const record: TransactionRecord = {
        id: crypto.randomUUID(),
        date: formData.date,
        savedAt: new Date().toLocaleString('vi-VN'),
        formData: { ...formData },
      };
      setHistory(prev => [record, ...prev]);
    }
  };

  const removeTransaction = async (id: string) => {
    if (useApi) {
      try {
        await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Lỗi xóa giao dịch:', err);
      }
    }
    setHistory(prev => prev.filter(t => t.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      setHistory([]);
    }
  };

  return { history, saveTransaction, removeTransaction, clearHistory };
}
