import { useState } from 'react';

export interface UNCFormData {
  date: string;
  payerName: string;
  payerAddress: string;
  payerAccount: string;
  payerBank: string;
  amount: string;
  amountWords: string;
  exchangeTo: string;
  exchangeRate: string;
  feeType: 'deduct' | 'cash' | 'account' | '';
  beneficiaryName: string;
  beneficiaryCCCD: string;
  cccdDate: string;
  cccdPlace: string;
  beneficiaryAddress: string;
  beneficiaryAccount: string;
  beneficiaryBank: string;
  remarks: string;
}

export function useUNCForm() {
  const today = new Date();
  const dateStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

  const [formData, setFormData] = useState<UNCFormData>({
    date: dateStr,
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
  });

  const updateField = (field: keyof UNCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateField, setFormData };
}
