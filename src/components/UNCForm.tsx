import { useState, useEffect } from 'react';
import { UNCFormData } from '@/hooks/useUNCForm';
import { Beneficiary } from '@/hooks/useBeneficiaries';
import { numberToVietnameseWords, formatCurrency } from '@/lib/numberToWords';
import { TransactionRecord } from '@/hooks/useTransactionHistory';
import { exportUNCToPDF } from '@/lib/exportPDF';

interface Props {
  formData: UNCFormData;
  updateField: (field: keyof UNCFormData, value: string) => void;
  beneficiaries: Beneficiary[];
  onSaveBeneficiary: (b: Omit<Beneficiary, 'id'>) => void;
  onRemoveBeneficiary: (id: string) => void;
  history: TransactionRecord[];
  onSaveTransaction: () => void;
  onLoadTransaction: (record: TransactionRecord) => void;
  onRemoveTransaction: (id: string) => void;
}

const InputField = ({ label, sublabel, value, onChange, placeholder, mono, type }: {
  label: string; sublabel?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; mono?: boolean; type?: string;
}) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {label} {sublabel && <span className="font-normal italic text-muted-foreground/70">{sublabel}</span>}
    </label>
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-border py-2 bg-transparent outline-none focus:border-bidv-blue transition-colors text-foreground placeholder:text-muted-foreground/50 ${mono ? 'font-mono tracking-widest' : ''}`}
    />
  </div>
);

export default function UNCForm({ formData, updateField, beneficiaries, onSaveBeneficiary, onRemoveBeneficiary, history, onSaveTransaction, onLoadTransaction, onRemoveTransaction }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!formData.payerName) {
      updateField('payerName', 'NHPTVN-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng');
      updateField('payerAddress', 'số 32, phố Xuân trường, phường Thục Phán, tỉnh Cao Bằng');
      updateField('payerAccount', '3300013207');
      updateField('payerBank', 'BIDV-Chi nhánh Cao Bằng');
      
      updateField('beneficiaryName', 'Danh sách cá nhân kèm theo');
      updateField('beneficiaryAccount', '280701009');
      updateField('beneficiaryBank', 'BIDV-Chi nhánh Cao Bằng');
    }
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Quan trọng: Truyền formData vào đây
      await exportUNCToPDF(formData);
      onSaveTransaction();
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setExporting(false);
    }
  };

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '');
    updateField('amount', cleaned);
    const num = parseInt(cleaned);
    if (!isNaN(num) && num > 0) {
      updateField('amountWords', numberToVietnameseWords(num));
    } else {
      updateField('amountWords', '');
    }
  };

  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  const handleSelectBeneficiary = (b: Beneficiary) => {
    updateField('beneficiaryName', b.name);
    updateField('beneficiaryAccount', b.account);
    updateField('beneficiaryBank', b.bank);
    setShowPicker(false);
  };

  const handleSaveCurrent = () => {
    if (!formData.beneficiaryName || !formData.beneficiaryAccount) return;
    onSaveBeneficiary({
      name: formData.beneficiaryName,
      account: formData.beneficiaryAccount,
      bank: formData.beneficiaryBank,
    });
    setShowPicker(true);
  };

  return (
    <aside className="w-[420px] shrink-0 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      <div className="bg-primary px-5 py-4 text-primary-foreground text-center relative overflow-hidden">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-copy-right {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 15s linear infinite;
          }
        `}</style>

        <h2 className="text-lg font-bold tracking-wide uppercase">Ủy nhiệm chi</h2>
        <p className="text-xs opacity-80 mb-2">Nhập thông tin để tạo UNC</p>
        
        <div className="w-full border-t border-primary-foreground/20 pt-2 overflow-hidden">
          <div className="animate-copy-right text-[10px] font-medium opacity-90">
            Copyright by Trần Nam Long NHPTVN-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <InputField label="Ngày" sublabel="Date" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />
        
        <div className="space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Bên trả tiền</p>
          <InputField label="Tên tài khoản trích nợ" sublabel="Dr A/C name" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" sublabel="Address" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <InputField label="Số tài khoản" sublabel="Dr A/C No" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
          <InputField label="Tại Ngân hàng" sublabel="At Bank" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Số tiền</p>
          <InputField label="Số tiền bằng số" sublabel="Amount in figures" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Số tiền bằng chữ</label>
            <p className="text-sm text-foreground min-h-[2em] border-b border-border py-2">{formData.amountWords || '\u00A0'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Người hưởng</p>
            <button onClick={handleSaveCurrent} className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">💾 Lưu</button>
          </div>
          <InputField label="Tên người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <InputField label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
          <InputField label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
        </div>
        
        <InputField label="Nội dung" sublabel="Remarks" value={formData.remarks} onChange={v => updateField('remarks', v)} />
      </div>

      <div className="px-5 py-3 border-t border-border space-y-2 bg-card">
        <div className="flex gap-2">
          <button onClick={handleExportPDF} disabled={exporting} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm disabled:opacity-50">
            {exporting ? 'Đang xuất...' : '📄 Xuất PDF'}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2.5 border border-border rounded-md text-sm">🖨️ In</button>
        </div>
      </div>
    </aside>
  );
}
