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

export default function UNCForm({ 
  formData, updateField, beneficiaries, onSaveBeneficiary, onRemoveBeneficiary, 
  history, onSaveTransaction, onLoadTransaction, onRemoveTransaction 
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false); 
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (formData.beneficiaryName && formData.amount) {
      onSaveTransaction();
    }
    setExporting(true);
    try {
      await exportUNCToPDF();
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setExporting(false);
    }
  };

  const handleSetDefault = () => {
    updateField('payerName', 'NHPTVN-Chi nhánh KV Bắc Đông Bắc,PGD Cao Bằng');
    updateField('payerAddress', 'Số 32, phố Xuân Trường, phường Thục Phán, tỉnh Cao Bằng');
    updateField('payerAccount', '3300013207');
    updateField('payerBank', 'BIDV - Chi nhánh Cao Bằng');

    updateField('beneficiaryName', 'Danh sách cá nhân kèm theo');
    updateField('beneficiaryAccount', '280701009');
    updateField('beneficiaryBank', 'BIDV - Chi nhánh Cao Bằng');
    updateField('beneficiaryCCCD', '');
    updateField('cccdDate', '');
    updateField('cccdPlace', '');
    updateField('beneficiaryAddress', '');
    updateField('remarks', '');
  };
// NÚT MỚI: Reset toàn bộ form về trạng thái trống
  const handleNewForm = () => {
    const fields: (keyof UNCFormData)[] = [
      'payerName', 'payerAddress', 'payerAccount', 'payerBank',
      'beneficiaryName', 'beneficiaryAccount', 'beneficiaryBank', 
      'beneficiaryCCCD', 'cccdDate', 'cccdPlace', 'beneficiaryAddress',
      'amount', 'amountWords', 'remarks', 'feeType'
    ];
    fields.forEach(field => updateField(field, ''));
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

  const handleFeeToggle = (id: string) => {
    updateField('feeType', formData.feeType === id ? '' : id);
  };

  const handleSaveBeneficiary = () => {
    if (!formData.beneficiaryName || !formData.beneficiaryAccount) return;
    onSaveBeneficiary({
      name: formData.beneficiaryName,
      account: formData.beneficiaryAccount,
      bank: formData.beneficiaryBank,
      address: formData.beneficiaryAddress,
      cccd: formData.beneficiaryCCCD,
      cccdDate: formData.cccdDate,
      cccdPlace: formData.cccdPlace
    });
  };

  const selectBeneficiary = (b: Beneficiary) => {
    updateField('beneficiaryName', b.name);
    updateField('beneficiaryAccount', b.account);
    updateField('beneficiaryBank', b.bank || '');
    updateField('beneficiaryAddress', b.address || '');
    updateField('beneficiaryCCCD', b.cccd || '');
    updateField('cccdDate', b.cccdDate || '');
    updateField('cccdPlace', b.cccdPlace || '');
    setShowPicker(false);
  };

  const selectHistoryRecord = (record: TransactionRecord) => {
    onLoadTransaction(record);
    setShowHistory(false);
  };

  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <aside className="w-[420px] shrink-0 bg-card border-r border-border flex flex-col h-screen overflow-hidden relative">
      
      {/* MODAL: DANH BẠ NGƯỜI HƯỞNG */}
      {showPicker && (
        <div className="absolute inset-0 z-50 bg-background/98 backdrop-blur-md p-5 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h3 className="font-bold text-bidv-blue uppercase text-sm tracking-wider">Danh bạ người hưởng</h3>
            <button onClick={() => setShowPicker(false)} className="px-3 py-1 bg-muted hover:bg-red-50 hover:text-red-600 text-muted-foreground rounded-md text-[10px] font-bold transition-all border border-border">
              ĐÓNG
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {beneficiaries.length === 0 ? (
              <div className="text-center py-20 text-xs text-muted-foreground">Chưa có người hưởng nào.</div>
            ) : (
              beneficiaries.map((b) => (
                <div key={b.id} onClick={() => selectBeneficiary(b)} className="p-4 border border-border/60 rounded-xl hover:border-bidv-blue hover:bg-bidv-blue/5 cursor-pointer transition-all group relative overflow-hidden shadow-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-bidv-blue transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  <p className="font-bold text-sm uppercase text-foreground">{b.name}</p>
                  <p className="text-xs font-mono text-bidv-blue mt-1">{b.account}</p>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveBeneficiary(b.id); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity">🗑️</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ GIAO DỊCH (ĐÃ SỬA LỖI HIỂN THỊ DỮ LIỆU) */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-background/98 backdrop-blur-md p-5 flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h3 className="font-bold text-bidv-blue uppercase text-sm tracking-wider">Lịch sử lập UNC</h3>
            <button onClick={() => setShowHistory(false)} className="px-3 py-1 bg-muted hover:bg-red-50 hover:text-red-600 text-muted-foreground rounded-md text-[10px] font-bold transition-all border border-border">
              ĐÓNG
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {(!history || history.length === 0) ? (
              <div className="text-center py-20 text-xs text-muted-foreground">Chưa có lịch sử giao dịch.</div>
            ) : (
              [...history].reverse().map((record) => {
                const bName = record.formData.beneficiaryName || 'N/A';
                const amt = record.formData.amount || '0';

                return (
                  <div 
                    key={record.id} 
                    onClick={() => selectHistoryRecord(record)}
                    className="p-4 border border-border/60 rounded-xl hover:border-bidv-blue hover:bg-bidv-blue/5 cursor-pointer transition-all group relative shadow-sm"
                  >
                    <p className="font-bold text-xs uppercase text-foreground truncate w-[85%]">
                      {bName}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-muted-foreground">{record.savedAt}</span>
                      <span className="text-xs font-mono font-bold text-bidv-blue">
                        {formatCurrency(parseInt(amt))}đ
                      </span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveTransaction(record.id); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity">🗑️</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-primary px-5 py-3 text-primary-foreground text-center relative overflow-hidden shrink-0">
        <style>{`
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-copy-right { display: inline-block; white-space: nowrap; animation: marquee 15s linear infinite; }
        `}</style>
        <h2 className="text-lg font-bold uppercase tracking-wider">Lập ủy nhiệm chi</h2>
        <div className="w-full border-t border-primary-foreground/20 mt-1 pt-1 overflow-hidden">
          <div className="animate-copy-right text-[10px] font-medium opacity-90 text-white/80">
            Copyright by Trần Nam Long VDB-Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
        <InputField label="Ngày" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />

        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Bên trả tiền</p>
            <div className="flex gap-2">
              <button onClick={handleNewForm} className="text-[10px] px-3 py-1 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-sm">
                NEW
              </button>
              <button onClick={handleSetDefault} className="text-[10px] px-3 py-1 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 transition-all shadow-sm">
                MẶC ĐỊNH
              </button>
            </div>
          </div>
          <InputField label="Tên tài khoản trích nợ" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
          <InputField label="Tại Ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
        </div>

        <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border/40">
          <InputField label="Số tiền bằng số" value={displayAmount} onChange={handleAmountChange} placeholder="Nhập số tiền..." mono />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Số tiền bằng chữ</label>
            <div className="text-[11px] text-foreground italic bg-background p-3 rounded-lg border border-dashed border-border/60 leading-relaxed min-h-[40px]">
              {formData.amountWords || <span className="text-muted-foreground/40 italic text-[10px]">Tự động chuyển đổi...</span>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">Loại phí</label>
            <div className="flex flex-col gap-2">
              {[{ id: 'deduct', label: 'Phí trong số tiền chuyển' }, { id: 'cash', label: 'Phí thu từ tiền mặt' }, { id: 'account', label: 'Phí thu từ tài khoản' }].map(ft => (
                <div key={ft.id} onClick={() => handleFeeToggle(ft.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer select-none ${formData.feeType === ft.id ? 'bg-bidv-blue/10 border-bidv-blue text-bidv-blue font-semibold' : 'bg-background border-border text-muted-foreground'}`}>
                  <div className={`w-3 h-3 rounded-full border ${formData.feeType === ft.id ? 'bg-bidv-blue border-bidv-blue' : 'border-muted-foreground'}`} />
                  <span className="text-[11px]">{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Người hưởng</p>
            <div className="flex gap-2">
              <button onClick={handleSaveBeneficiary} className="text-[10px] px-3 py-1 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-sm">
                LƯU
              </button>
              <button onClick={() => setShowPicker(true)} className="text-[10px] px-3 py-1 bg-bidv-blue text-white rounded-full font-bold transition-all shadow-sm">
                DANH BẠ
              </button>
              <button onClick={() => setShowHistory(true)} className="text-[10px] px-3 py-1 bg-slate-600 text-white rounded-full font-bold transition-all shadow-sm">
                LỊCH SỬ
              </button>
            </div>
          </div>
          <InputField label="Tên người hưởng" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
          <InputField label="Tại Ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          <InputField label="Địa chỉ" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
        </div>

        <InputField label="Nội dung thanh toán" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Nội dung chuyển tiền..." />
      </div>

      <div className="px-5 py-4 border-t border-border bg-card shadow-sm shrink-0">
        <div className="flex gap-3">
          <button onClick={handleExportPDF} disabled={exporting} className="flex-1 bg-bidv-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md">
            {exporting ? 'ĐANG XỬ LÝ...' : '📄 XUẤT PDF A4'}
          </button>
          <button onClick={() => { if (formData.beneficiaryName && formData.amount) onSaveTransaction(); window.print(); }} className="px-5 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            🖨️ IN
          </button>
        </div>
      </div>
    </aside>
  );
}
