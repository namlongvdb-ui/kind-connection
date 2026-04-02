import { useState, useEffect } from 'react';
import { UNCFormData } from '@/hooks/useUNCForm';

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

function loadHistory(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Đảm bảo dữ liệu luôn được chuẩn hóa khi tải lên
    return parsed
      .filter((item): item is LegacyTransactionRecord => !!item && typeof item === 'object')
      .map(normalizeRecord);
  } catch {
    return [];
  }
}

export function useTransactionHistory() {
  const [history, setHistory] = useState<TransactionRecord[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const saveTransaction = (formData: UNCFormData) => {
    // 1. Kiểm tra dữ liệu đầu vào tối thiểu
    if (!formData.beneficiaryAccount || !formData.amount) return;

    // 2. Logic kiểm tra trùng lặp với bản ghi GẦN NHẤT (history[0])
    if (history.length > 0) {
      const last = history[0].formData;
      
      const isDuplicate = 
        last.date === formData.date &&
        last.payerAccount === formData.payerAccount &&
        last.payerName === formData.payerName && // Thêm kiểm tra tên người trả
        last.beneficiaryAccount === formData.beneficiaryAccount &&
        last.beneficiaryName === formData.beneficiaryName &&
        last.beneficiaryBank === formData.beneficiaryBank && // Thêm kiểm tra ngân hàng hưởng
        last.amount === formData.amount &&
        last.remarks === formData.remarks;

      if (isDuplicate) {
        console.log("UNC trùng lặp với giao dịch vừa thực hiện, không lưu.");
        return;
      }
    }

    // 3. Tạo bản ghi mới nếu không trùng
    const record: TransactionRecord = {
      id: crypto.randomUUID(),
      date: formData.date,
      savedAt: new Date().toLocaleString('vi-VN'),
      formData: { ...formData }, // Clone object để tránh tham chiếu
    };

    setHistory(prev => [record, ...prev]);
  };

  const removeTransaction = (id: string) => {
    setHistory(prev => prev.filter(t => t.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      setHistory([]);
    }
  };

  return { history, saveTransaction, removeTransaction, clearHistory };
}
