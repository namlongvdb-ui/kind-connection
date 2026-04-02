import { useState, useEffect, useCallback } from 'react';
import { isApiAvailable, apiFetch } from '@/lib/api';

// @refresh reset

export interface Beneficiary {
  id: string;
  name: string;
  account: string;
  bank: string;
  address?: string;
  cccd?: string;
  cccdDate?: string;
  cccdPlace?: string;
}

const STORAGE_KEY = 'unc-beneficiaries';

function loadLocal(): Beneficiary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(list: Beneficiary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(loadLocal);
  const [useApi, setUseApi] = useState(false);

  // Kiểm tra API và tải dữ liệu từ server nếu có
  useEffect(() => {
    isApiAvailable().then(async (available) => {
      setUseApi(available);
      if (available) {
        try {
          const data = await apiFetch<Beneficiary[]>('/api/beneficiaries');
          setBeneficiaries(data);
        } catch (err) {
          console.warn('Không thể tải danh bạ từ server, dùng localStorage:', err);
          setBeneficiaries(loadLocal());
        }
      }
    });
  }, []);

  // Lưu localStorage khi không có API
  useEffect(() => {
    if (!useApi) {
      saveLocal(beneficiaries);
    }
  }, [beneficiaries, useApi]);

  const addBeneficiary = async (b: Omit<Beneficiary, 'id'>) => {
    const exists = beneficiaries.some(
      x => x.account === b.account && x.bank === b.bank
    );
    if (exists) return;

    if (useApi) {
      try {
        const result = await apiFetch<{ id: string }>('/api/beneficiaries', {
          method: 'POST',
          body: JSON.stringify(b),
        });
        setBeneficiaries(prev => [...prev, { ...b, id: result.id }]);
      } catch (err) {
        console.error('Lỗi lưu danh bạ:', err);
      }
    } else {
      setBeneficiaries(prev => [...prev, { ...b, id: crypto.randomUUID() }]);
    }
  };

  const removeBeneficiary = async (id: string) => {
    if (useApi) {
      try {
        await apiFetch(`/api/beneficiaries/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Lỗi xóa danh bạ:', err);
      }
    }
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  };

  return { beneficiaries, addBeneficiary, removeBeneficiary };
}
