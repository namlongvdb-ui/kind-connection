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
    // Không lưu trùng nếu UNC giống hệt bản ghi gần nhất
    if (history.length > 0) {
      const last = history[0].formData;
      const same = last.beneficiaryName === formData.beneficiaryName
        && last.beneficiaryAccount === formData.beneficiaryAccount
        && last.amount === formData.amount
        && last.remarks === formData.remarks
        && last.date === formData.date
        && last.payerAccount === formData.payerAccount;
      if (same) return;
    }

    const record: TransactionRecord = {
      id: crypto.randomUUID(),
      date: formData.date,
      savedAt: new Date().toLocaleString('vi-VN'),
      formData: { ...formData },
    };
    setHistory(prev => [record, ...prev]);
  };

  const removeTransaction = (id: string) => {
    setHistory(prev => prev.filter(t => t.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return { history, saveTransaction, removeTransaction, clearHistory };
}
