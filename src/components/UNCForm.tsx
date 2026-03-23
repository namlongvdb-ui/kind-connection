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
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-border py-1.5 bg-transparent outline-none focus:border-bidv-blue transition-colors text-sm text-foreground placeholder:text-muted-foreground/50 ${mono ? 'font-mono tracking-wider' : ''}`}
    />
  </div>
);

export default function UNCForm({ formData, updateField, beneficiaries, onSaveBeneficiary, onRemoveBeneficiary, history, onSaveTransaction, onLoadTransaction, onRemoveTransaction }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!formData.payerName) {
      updateField('payerName', 'NHPTVN-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng');
      updateField('payerAddress', 'Số 32, phố Xuân Trường, phường Thục Phán, TP. Cao Bằng, tỉnh Cao Bằng');
      updateField('payerAccount', '3300013207');
      updateField('payerBank', 'BIDV-Chi nhánh Cao Bằng');
    }
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
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

  // Logic mới: Cho phép bỏ chọn loại phí
  const handleFeeToggle = (id: string) => {
    if (formData.feeType === id) {
      updateField('feeType', ''); // Nhấn lại cái đang chọn -> Bỏ chọn
    } else {
      updateField('feeType', id); // Nhấn cái mới -> Chọn
    }
  };

  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <aside className="w-[420px] shrink-0 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      <div className="bg-primary px-5 py-3 text-primary-foreground text-center relative overflow-hidden">
        <style>{`
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-copy-right { display: inline-block; white-space: nowrap; animation: marquee 15s linear infinite; }
        `}</style>
        <h2 className="text-lg font-bold uppercase tracking-wider">Ủy nhiệm chi</h2>
        <div className="w-full border-t border-primary-foreground/20 mt-1 pt-1 overflow-hidden">
          <div className="animate-copy-right text-[10px] font-medium opacity-90">
            Copyright by Trần Nam Long NHPTVN-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <InputField label="Ngày" sublabel="Date" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />

        {/* BÊN TRẢ TIỀN - Đã thêm Địa chỉ */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/20 pb-1">Bên trả tiền (Payer)</p>
          <InputField label="Tên tài khoản trích nợ" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
          <InputField label="Tại Ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
        </div>

        {/* SỐ TIỀN & PHÍ - Đã sửa logic Toggle */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <InputField label="Số tiền bằng số" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Số tiền bằng chữ</label>
            <p className="text-[11px] text-foreground italic bg-background p-2 rounded border border-dashed leading-tight">
              {formData.amountWords || '...'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Đề nghị quy đổi ra" value={formData.exchangeTo} onChange={v => updateField('exchangeTo', v)} placeholder="USD, EUR..." />
            <InputField label="Tỷ giá" value={formData.exchangeRate} onChange={v => updateField('exchangeRate', v)} />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted-foreground">Loại phí (Fee Type)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                { id: 'deduct', label: 'Phí trong số tiền chuyển' },
                { id: 'cash', label: 'Phí thu từ tiền mặt' },
                { id: 'account', label: 'Phí thu từ tài khoản' }
              ].map(ft => (
                <div 
                  key={ft.id}
                  onClick={() => handleFeeToggle(ft.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded border transition-all cursor-pointer select-none
                    ${formData.feeType === ft.id 
                      ? 'bg-primary/10 border-primary text-primary font-medium' 
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${formData.feeType === ft.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                    {formData.feeType === ft.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] leading-none">{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NGƯỜI HƯỞNG */}
        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between border-b border-primary/20 pb-1">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Người hưởng (Beneficiary)</p>
            <button onClick={() => setShowPicker(!showPicker)} className="text-[10px] px-2 py-0.5 bg-primary text-white rounded hover:bg-primary/90">Danh bạ</button>
          </div>
          
          <InputField label="Tên người hưởng" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
          <InputField label="Tại Ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          <InputField label="Địa chỉ người hưởng" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />

          <div className="grid grid-cols-1 gap-3 pt-2 border-t border-dotted">
            <InputField label="Số CCCD/Hộ chiếu" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} mono />
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Ngày cấp" value={formData.cccdDate} onChange={v => updateField('cccdDate', v)} />
              <InputField label="Nơi cấp" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} />
            </div>
          </div>
        </div>

        <InputField label="Nội dung thanh toán" value={formData.remarks} onChange={v => updateField('remarks', v)} />
      </div>

      <div className="px-5 py-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF} 
            disabled={exporting} 
            className="flex-1 bg-bidv-blue text-white py-2.5 rounded-md font-bold text-sm hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {exporting ? 'ĐANG TẠO PDF...' : '📄 XUẤT PDF A4'}
          </button>
          <button onClick={() => window.print()} className="px-4 py-2.5 border border-border rounded-md text-sm hover:bg-muted transition-colors">🖨️ In</button>
        </div>
      </div>
    </aside>
  );
}
