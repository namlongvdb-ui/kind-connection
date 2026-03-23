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
  feeType: 'deduct' | 'cash' | 'account';
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
    payerName: 'NHPTVN-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng',
    payerAddress: 'Số 32, phố Xuân Trường, phường Thục Phán, tỉnh Cao Bằng',
    payerAccount: '3300013207',
    payerBank: 'BIDV - Chi nhánh Cao Bằng',
    amount: '',
    amountWords: '',
    exchangeTo: '',
    exchangeRate: '',
    feeType: 'deduct',
    beneficiaryName: 'Danh sách cá nhân kèm theo',
    beneficiaryCCCD: '',
    cccdDate: '',
    cccdPlace: '',
    beneficiaryAddress: '',
    beneficiaryAccount: '280701009',
    beneficiaryBank: 'BIDV - Chi nhánh Cao Bằng',
    remarks: '',
  });

  const updateField = (field: keyof UNCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateField, setFormData };
}
