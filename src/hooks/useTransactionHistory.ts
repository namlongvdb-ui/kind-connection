import { useState, useEffect } from 'react';
import { UNCFormData } from '@/hooks/useUNCForm';

export interface TransactionRecord {
  id: string;
  date: string;
  savedAt: string;
  formData: UNCFormData;
}

const STORAGE_KEY = 'unc-history';

function loadHistory(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
