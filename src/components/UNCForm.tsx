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
  <div className="group flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider transition-colors group-focus-within:text-bidv-blue flex justify-between">
      <span>{label}</span>
      {sublabel && <span className="font-normal normal-case italic text-slate-400">{sublabel}</span>}
    </label>
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-b border-slate-200 py-1.5 bg-transparent outline-none focus:border-bidv-blue transition-all text-[13px] text-slate-800 placeholder:text-slate-300 ${mono ? 'font-mono tracking-wider text-bidv-blue font-semibold' : ''}`}
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
    <aside className="w-[420px] shrink-0 bg-[#F8FAFC] border-r border-slate-200 flex flex-col h-screen overflow-hidden relative shadow-2xl">
      
      {/* MODAL: DANH BẠ */}
      {showPicker && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bidv-blue" /> Danh bạ người nhận
            </h3>
            <button onClick={() => setShowPicker(false)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">
              ĐÓNG [X]
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {beneficiaries.length === 0 ? (
              <div className="text-center py-20 text-xs text-slate-400 italic">Chưa có dữ liệu</div>
            ) : (
              beneficiaries.map((b) => (
                <div key={b.id} onClick={() => selectBeneficiary(b)} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-bidv-blue/40 hover:shadow-md cursor-pointer transition-all group relative">
                  <p className="font-bold text-[12px] uppercase text-slate-700">{b.name}</p>
                  <p className="text-[11px] font-mono text-bidv-blue">{b.account}</p>
                  <button onClick={(e) => { e.stopPropagation(); onRemoveBeneficiary(b.id); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">🗑️</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: LỊCH SỬ */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md p-6 flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Giao dịch gần đây
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">
              ĐÓNG [X]
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {(!history || history.length === 0) ? (
              <div className="text-center py-20 text-xs text-slate-400 italic">Lịch sử trống</div>
            ) : (
              [...history].reverse().map((record) => {
                const bName = record.formData.beneficiaryName || "N/A";
                const amt = record.formData.amount || "0";
                return (
                  <div key={record.id} onClick={() => selectHistoryRecord(record)} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-bidv-blue/40 hover:shadow-md cursor-pointer transition-all group relative">
                    <p className="font-bold text-[11px] uppercase text-slate-700 truncate w-[85%]">{bName}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[9px] text-slate-400">{record.savedAt}</span>
                      <span className="text-[11px] font-mono font-bold text-bidv-blue">{formatCurrency(parseInt(amt))}đ</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onRemoveTransaction(record.id); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-red-400">🗑️</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* HEADER: Dòng chữ chạy không viết hoa */}
      <div className="bg-white px-6 py-5 border-b border-slate-200 relative shrink-0">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Lập ủy nhiệm chi</h2>
        <div className="mt-1 overflow-hidden">
          <style>{`
            @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
            .animate-footer { display: inline-block; white-space: nowrap; animation: marquee 25s linear infinite; }
          `}</style>
          <div className="animate-footer text-[10px] font-medium text-slate-500 tracking-wide">
            Bản quyền thuộc về Trần Nam Long — VDB Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
        
        {/* SECTION: THÔNG TIN CHUNG & TOOLS */}
        <div className="flex items-end gap-3">
            <div className="flex-1">
                <InputField label="Ngày chứng từ" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />
            </div>
            <div className="flex gap-1.5 pb-0.5">
              <button onClick={handleNewForm} className="h-8 px-3 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100 transition-colors uppercase">✨ Mới</button>
              <button onClick={handleSetDefault} className="h-8 px-3 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors uppercase">🏠 Gốc</button>
            </div>
        </div>

        {/* SECTION: BÊN TRẢ TIỀN */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm space-y-4 relative">
          <div className="absolute top-4 right-5 w-2 h-2 rounded-full bg-slate-200" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-300 pl-2">Thông tin tài khoản nợ</p>
          <InputField label="Đơn vị trả tiền" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
            <InputField label="Tại ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
          </div>
        </div>

        {/* SECTION: SỐ TIỀN & PHÍ */}
        <div className="p-5 bg-slate-800 text-white rounded-2xl shadow-xl space-y-6">
          <InputField label="Số tiền thanh toán" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bằng chữ</label>
            <div className="text-[12px] text-amber-200 font-medium italic leading-relaxed min-h-[36px]">
              {formData.amountWords || <span className="opacity-20 not-italic">Đang chờ nhập số tiền...</span>}
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phí ngân hàng</label>
            <div className="grid grid-cols-1 gap-2">
              {[{ id: 'deduct', label: 'Khấu trừ vào số tiền chuyển' }, { id: 'cash', label: 'Thu bằng tiền mặt' }, { id: 'account', label: 'Trích từ tài khoản' }].map(ft => (
                <div key={ft.id} onClick={() => handleFeeToggle(ft.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${formData.feeType === ft.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.feeType === ft.id ? 'border-amber-400' : 'border-slate-600'}`}>
                    {formData.feeType === ft.id && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <span className="text-[11px] font-medium">{ft.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: NGƯỜI HƯỞNG */}
        <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest border-l-2 border-emerald-400 pl-2">Thông tin người thụ hưởng</p>
            <div className="flex gap-1">
              <button onClick={handleSaveBeneficiary} className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm" title="Lưu vào danh bạ">💾</button>
              <button onClick={() => setShowPicker(true)} className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shadow-sm" title="Mở danh bạ">📖</button>
              <button onClick={() => setShowHistory(true)} className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shadow-sm" title="Lịch sử giao dịch">⌛</button>
            </div>
          </div>
          <InputField label="Họ và tên" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
            <InputField label="Tại ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          </div>
          <InputField label="Địa chỉ" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
          
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-50">
            <InputField label="Số CCCD/Hộ chiếu" value={formData.beneficiaryCCCD} onChange={v => updateField('beneficiaryCCCD', v)} mono />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ngày cấp" value={formData.cccdDate} onChange={handleCccdDateChange} placeholder="DD/MM/YYYY" />
              <InputField label="Nơi cấp" value={formData.cccdPlace} onChange={v => updateField('cccdPlace', v)} />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <InputField label="Nội dung chuyển tiền" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Nhập nội dung thanh toán..." />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-6 py-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0">
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF} 
            disabled={exporting} 
            className="flex-[2] bg-bidv-blue text-white py-4 rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-bidv-blue/20 transition-all disabled:opacity-50 active:scale-[0.98] uppercase tracking-[0.1em]"
          >
            {exporting ? 'Đang tạo File...' : 'Xuất ủy nhiệm chi (PDF)'}
          </button>
          <button 
            onClick={() => { if (formData.beneficiaryName && formData.amount) onSaveTransaction(); window.print(); }} 
            className="flex-1 bg-slate-50 text-slate-600 py-4 rounded-xl font-bold text-[10px] hover:bg-slate-100 transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            In nhanh
          </button>
        </div>
      </div>
    </aside>
  );
}
