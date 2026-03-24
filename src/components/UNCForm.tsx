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
  <div className="group">
    <label className="block text-[11px] font-semibold text-muted-foreground/80 mb-1 uppercase tracking-tight transition-colors group-focus-within:text-bidv-blue">
      {label} {sublabel && <span className="font-normal italic text-muted-foreground/60">{sublabel}</span>}
    </label>
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-border/60 py-1.5 bg-transparent outline-none focus:border-bidv-blue transition-all text-sm text-foreground placeholder:text-muted-foreground/40 ${mono ? 'font-mono tracking-wider text-bidv-blue' : ''}`}
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

  const handleNewForm = () => {
    const fields: (keyof UNCFormData)[] = [
      'payerName', 'payerAddress', 'payerAccount', 'payerBank',
      'beneficiaryName', 'beneficiaryAccount', 'beneficiaryBank', 
      'beneficiaryCCCD', 'cccdDate', 'cccdPlace', 'beneficiaryAddress',
      'amount', 'amountWords', 'remarks', 'feeType'
    ];
    fields.forEach(field => updateField(field, ''));
  };

  const formatDateInput = (val: string): string => {
    const digits = val.replace(/[^\d]/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleCccdDateChange = (val: string) => {
    updateField('cccdDate', formatDateInput(val));
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
    <aside className="w-[420px] shrink-0 bg-card border-r border-border flex flex-col h-screen overflow-hidden relative shadow-xl">
      
      {/* MODAL: DANH BẠ */}
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
              <div className="text-center py-20 text-xs text-muted-foreground italic">Chưa có người hưởng nào.</div>
            ) : (
              beneficiaries.map((b) => (
                <div key={b.id} onClick={() => selectBeneficiary(b)} className="p-4 border border-border/60 rounded-xl hover:border-bidv-blue hover:bg-bidv-blue/5 cursor-pointer transition-all group relative overflow-hidden shadow-sm bg-background">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-bidv-blue transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                  <p className="font-bold text-sm uppercase text-foreground">{b.name}</p>
                  <p className="text-xs font-mono text-bidv-blue mt-1">{b.account}</p>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveBeneficiary(b.id); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity hover:scale-110">🗑️</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ */}
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
              <div className="text-center py-20 text-xs text-muted-foreground italic">Chưa có lịch sử giao dịch.</div>
            ) : (
              [...history].reverse().map((record) => {
                const bName = record.formData.beneficiaryName || "N/A";
                const amt = record.formData.amount || "0";
                const remarks = record.formData.remarks || "";

                return (
                  <div key={record.id} onClick={() => selectHistoryRecord(record)} className="p-4 border border-border/60 rounded-xl hover:border-bidv-blue hover:bg-bidv-blue/5 cursor-pointer transition-all group relative shadow-sm bg-background">
                    <p className="font-bold text-xs uppercase text-foreground truncate w-[85%]">{bName}</p>
                    {remarks && <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{remarks}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-muted-foreground">{record.savedAt}</span>
                      <span className="text-xs font-mono font-bold text-bidv-blue">{formatCurrency(parseInt(amt))}đ</span>
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
      <div className="bg-primary px-5 py-4 text-primary-foreground text-center relative overflow-hidden shrink-0 shadow-lg">
        <style>{`
          @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
          .animate-copy-right { display: inline-block; white-space: nowrap; animation: marquee 20s linear infinite; }
        `}</style>
        <h2 className="text-lg font-extrabold uppercase tracking-[0.15em]">Lập ủy nhiệm chi</h2>
        <div className="w-full border-t border-primary-foreground/10 mt-2 pt-2 overflow-hidden">
          <div className="animate-copy-right text-[9px] font-medium opacity-70 tracking-widest uppercase">
            Copyright by Trần Nam Long — VDB Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 custom-scrollbar bg-slate-50/30">
        
        {/* SECTION: THÔNG TIN CHUNG */}
        <div className="flex items-end gap-4">
            <div className="flex-1">
                <InputField label="Ngày lập lệnh" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />
            </div>
            <div className="flex gap-2 pb-1">
              <button onClick={handleNewForm} className="text-[10px] px-3 py-1.5 bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95 uppercase tracking-tighter">
                ✨Lập mới
              </button>
              <button onClick={handleSetDefault} className="text-[10px] px-3 py-1.5 bg-amber-500 text-white rounded-md font-bold hover:bg-amber-600 transition-all shadow-sm active:scale-95 uppercase tracking-tighter">
                🏠Mặc định
              </button>
            </div>
        </div>

        {/* SECTION: BÊN TRẢ TIỀN */}
        <div className="space-y-4 p-5 bg-white rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-400/30" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Bên trả tiền
          </p>
          <InputField label="Tên tài khoản trích nợ" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
            <InputField label="Tại Ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
          </div>
        </div>

        {/* SECTION: SỐ TIỀN & PHÍ */}
        <div className="space-y-5 p-5 bg-white rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-bidv-blue/30" />
          <div className="grid grid-cols-1 gap-4">
            <InputField label="Số tiền thanh toán" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5 tracking-tight">Số tiền bằng chữ</label>
              <div className="text-[11px] text-bidv-blue font-medium italic bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 leading-relaxed min-h-[46px] flex items-center">
                {formData.amountWords || <span className="text-muted-foreground/30 italic text-[10px]">Tự động chuyển đổi từ số tiền...</span>}
              </div>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Phương thức thu phí</label>
            <div className="grid grid-cols-1 gap-2">
              {[{ id: 'deduct', label: 'Phí trong số tiền chuyển' }, { id: 'cash', label: 'Phí thu từ tiền mặt' }, { id: 'account', label: 'Phí thu từ tài khoản' }].map(ft => (
                <div key={ft.id} onClick={() => handleFeeToggle(ft.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer select-none ${formData.feeType === ft.id ? 'bg-bidv-blue/5 border-bidv-blue/50 text-bidv-blue shadow-inner' : 'bg-background border-border/50 text-muted-foreground hover:border-slate-300'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${formData.feeType === ft.id ? 'border-bidv-blue' : 'border-slate-300'}`}>
                    {formData.feeType === ft.id && <div className="w-1.5 h-1.5 rounded-full bg-bidv-blue" />}
                  </div>
                  <span className={`text-[11px] ${formData.feeType === ft.id ? 'font-bold' : 'font-medium'}`}>{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: NGƯỜI HƯỞNG */}
        <div className="space-y-4 p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30" />
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Người hưởng thụ
            </p>
            <div className="flex gap-1.5">
              <button onClick={handleSaveBeneficiary} className="text-[9px] px-2.5 py-1 bg-emerald-600 text-white rounded-md font-bold hover:bg-emerald-700 transition-all uppercase tracking-tighter shadow-sm">
                💾Lưu
              </button>
              <button onClick={() => setShowPicker(true)} className="text-[9px] px-2.5 py-1 bg-bidv-blue text-white rounded-md font-bold hover:opacity-90 transition-all uppercase tracking-tighter shadow-sm">
                📖Danh bạ
              </button>
              <button onClick={() => setShowHistory(true)} className="text-[9px] px-2.5 py-1 bg-slate-600 text-white rounded-md font-bold hover:opacity-90 transition-all uppercase tracking-tighter shadow-sm">
                ⌛Lịch sử
              </button>
            </div>
          </div>
          <InputField label="Tên người nhận" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
            <InputField label="Tại Ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          </div>
          <InputField label="Địa chỉ" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
          
          <div className="grid grid-cols-1 gap-4 pt-3 mt-1 border-t border-slate-100">
            <InputField label="Số CCCD/Hộ chiếu" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} mono />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ngày cấp" value={formData.cccdDate} onChange={handleCccdDateChange} placeholder="DD/MM/YYYY" />
              <InputField label="Nơi cấp" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} />
            </div>
          </div>
        </div>

        <div className="pb-4">
            <InputField label="Nội dung thanh toán" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Nhập nội dung chuyển tiền..." />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-5 py-5 border-t border-border bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0">
        <div className="flex gap-3">
          <button onClick={handleExportPDF} disabled={exporting} className="flex-[2] bg-bidv-blue text-white py-3.5 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
            {exporting ? 'ĐANG XỬ LÝ...' : (
                <>
                    <span className="text-lg">📄</span> XUẤT PDF A4
                </>
            )}
          </button>
          <button onClick={() => { if (formData.beneficiaryName && formData.amount) onSaveTransaction(); window.print(); }} className="flex-1 px-4 py-3.5 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <span className="text-lg">🖨️</span> IN
          </button>
        </div>
      </div>
    </aside>
  );
}
