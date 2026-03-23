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
      await exportUNCToPDF();
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
      {/* Header căn giữa và Chữ chạy bằng CSS Animation */}
      <div className="bg-primary px-5 py-4 text-primary-foreground text-center relative overflow-hidden">
        <h2 className="text-lg font-bold tracking-wide uppercase">Ủy nhiệm chi</h2>
        <p className="text-xs opacity-80 mb-2">Nhập thông tin để tạo UNC</p>
        
        {/* Container cho chữ chạy */}
        <div className="w-full border-t border-primary-foreground/20 pt-2 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-marquee-infinite text-[10px] font-medium opacity-90">
                  Copyright by Trần Nam Long VDB-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng            
          </div>
        </div>
      </div>
      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <InputField label="Ngày" sublabel="Date" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />

        {/* Payer section */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Bên trả tiền</p>
          <InputField label="Tên tài khoản trích nợ" sublabel="Dr A/C name" value={formData.payerName} onChange={v => updateField('payerName', v)} placeholder="Nhập tên chủ tài khoản" />
          <InputField label="Địa chỉ" sublabel="Address" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <InputField label="Số tài khoản" sublabel="Dr A/C No" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
          <InputField label="Tại Ngân hàng" sublabel="At Bank" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
        </div>

        {/* Amount section */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Số tiền</p>
          <InputField label="Số tiền bằng số" sublabel="Amount in figures" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Số tiền bằng chữ <span className="font-normal italic text-muted-foreground/70">Amount in words</span></label>
            <p className="text-sm text-foreground min-h-[2em] border-b border-border py-2">{formData.amountWords || '\u00A0'}</p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Loại phí <span className="font-normal italic text-muted-foreground/70">Fee type</span></label>
            <div className="flex gap-4 mt-1">
              {(['deduct', 'cash', 'account'] as const).map(ft => (
                <label key={ft} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input 
                    type="radio" 
                    name="feeType" 
                    checked={formData.feeType === ft} 
                    onClick={() => {
                      if (formData.feeType === ft) updateField('feeType', '');
                      else updateField('feeType', ft);
                    }}
                    onChange={() => {}} 
                    className="accent-primary" 
                  />
                  {ft === 'deduct' ? 'Trích nợ' : ft === 'cash' ? 'Tiền mặt' : 'Tài khoản'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <InputField label="Đề nghị quy đổi ra" sublabel="Changing into" value={formData.exchangeTo} onChange={v => updateField('exchangeTo', v)} />
            </div>
            <InputField label="Tỷ giá" sublabel="Ex rate" value={formData.exchangeRate} onChange={v => updateField('exchangeRate', v)} />
          </div>
        </div>

        {/* Beneficiary section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Người hưởng</p>
            <div className="flex gap-2">
              {beneficiaries.length > 0 && (
                <button onClick={() => setShowPicker(!showPicker)} className="text-xs px-2 py-1 border border-primary text-primary rounded hover:bg-primary hover:text-primary-foreground transition-colors">
                  {showPicker ? 'Đóng DS' : 'Chọn từ DS'}
                </button>
              )}
              <button onClick={handleSaveCurrent} className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1">
                <span>💾</span> Lưu người hưởng
              </button>
            </div>
          </div>

          {showPicker && beneficiaries.length > 0 && (
            <div className="bg-muted rounded-md p-2 space-y-1 max-h-40 overflow-y-auto border border-border shadow-inner">
              {beneficiaries.map(b => (
                <div key={b.id} className="flex items-center justify-between text-xs p-2 hover:bg-background rounded cursor-pointer border-b border-border/50 last:border-0" onClick={() => handleSelectBeneficiary(b)}>
                  <div className="flex flex-col">
                    <span className="font-bold">{b.name}</span>
                    <span className="text-muted-foreground">{b.account} - {b.bank}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onRemoveBeneficiary(b.id); }} className="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors">Xóa</button>
                </div>
              ))}
            </div>
          )}

          <InputField label="Tên người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <InputField label="Số CCCD/HC" sublabel="ID No" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} mono />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Ngày cấp" sublabel="Date" value={formData.cccdDate} onChange={v => updateField('cccdDate', v)} />
            <InputField label="Nơi cấp" sublabel="Place" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} />
          </div>
          <InputField label="Địa chỉ" sublabel="Address" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
          <InputField label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
          <InputField label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
        </div>

        <InputField label="Nội dung" sublabel="Remarks" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Nội dung chuyển khoản" />
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 border-t border-border space-y-2 bg-card">
        <div className="flex gap-2">
          <button onClick={handleExportPDF} disabled={exporting} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
            {exporting ? 'Đang xuất...' : '📄 Xuất PDF'}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2.5 border border-border rounded-md text-sm hover:bg-muted transition-colors">
            🖨️ In
          </button>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
          {showHistory ? '▲ Ẩn lịch sử' : '▼ Lịch sử giao dịch'} ({history.length})
        </button>
        {showHistory && history.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1">
            {history.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs p-2 bg-muted rounded border border-border/50">
                <button onClick={() => onLoadTransaction(r)} className="hover:underline text-left">
                  {r.savedAt} - {r.formData.beneficiaryName || 'Chưa có'}
                </button>
                <button onClick={() => onRemoveTransaction(r.id)} className="text-destructive hover:underline">Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
