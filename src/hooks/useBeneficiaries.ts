import { useState, useEffect } from 'react';

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

function loadBeneficiaries(): Beneficiary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBeneficiaries(list: Beneficiary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(loadBeneficiaries);

  useEffect(() => {
    saveBeneficiaries(beneficiaries);
  }, [beneficiaries]);

  const addBeneficiary = (b: Omit<Beneficiary, 'id'>) => {
    const exists = beneficiaries.some(
      x => x.account === b.account && x.bank === b.bank
    );
    if (exists) return;
    setBeneficiaries(prev => [...prev, { ...b, id: crypto.randomUUID() }]);
  };

  const removeBeneficiary = (id: string) => {
    setBeneficiaries(prev => prev.filter(b => b.id !== id));
  };

  return { beneficiaries, addBeneficiary, removeBeneficiary };
}
