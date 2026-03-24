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
  <div className="group flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-bidv-blue transition-colors">
      {label} {sublabel && <span className="font-normal normal-case italic opacity-60">({sublabel})</span>}
    </label>
    <div className="relative">
      <input
        type={type || 'text'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent border-b border-slate-200 py-1 transition-all outline-none focus:border-bidv-blue text-[14px] text-slate-800 placeholder:text-slate-200 ${mono ? 'font-mono font-bold text-bidv-blue tracking-wider' : 'font-medium'}`}
      />
      <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-bidv-blue transition-all duration-300 group-focus-within:w-full" />
    </div>
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
    if (formData.beneficiaryName && formData.amount) onSaveTransaction();
    setExporting(true);
    try { await exportUNCToPDF(); } catch (e) { console.error(e); } finally { setExporting(false); }
  };

  const handleSetDefault = () => {
    updateField('payerName', 'NHPTVN-Chi nhánh KV Bắc Đông Bắc,PGD Cao Bằng');
    updateField('payerAddress', 'Số 32, phố Xuân Trường, phường Thục Phán, tỉnh Cao Bằng');
    updateField('payerAccount', '3300013207');
    updateField('payerBank', 'BIDV - Chi nhánh Cao Bằng');
    updateField('beneficiaryName', 'Danh sách cá nhân kèm theo');
    updateField('beneficiaryAccount', '280701009');
    updateField('beneficiaryBank', 'BIDV - Chi nhánh Cao Bằng');
  };

  const handleNewForm = () => {
    const fields: (keyof UNCFormData)[] = ['payerName', 'payerAddress', 'payerAccount', 'payerBank', 'beneficiaryName', 'beneficiaryAccount', 'beneficiaryBank', 'beneficiaryCCCD', 'cccdDate', 'cccdPlace', 'beneficiaryAddress', 'amount', 'amountWords', 'remarks', 'feeType'];
    fields.forEach(f => updateField(f, ''));
  };

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '');
    updateField('amount', cleaned);
    const num = parseInt(cleaned);
    updateField('amountWords', !isNaN(num) && num > 0 ? numberToVietnameseWords(num) : '');
  };

  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <aside className="w-[440px] shrink-0 bg-[#F8FAFC] border-r border-slate-200 flex flex-col h-screen overflow-hidden shadow-2xl">
      
      {/* HEADER: Chuyên nghiệp & Nhẹ nhàng */}
      <div className="bg-white px-7 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-5 bg-bidv-blue rounded-full" />
          <h2 className="text-[15px] font-black text-slate-800 tracking-tight uppercase">Giao dịch ủy nhiệm chi</h2>
        </div>
        <div className="overflow-hidden">
          <style>{`
            @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
            .animate-footer { display: inline-block; white-space: nowrap; animation: marquee 22s linear infinite; }
          `}</style>
          <div className="animate-footer text-[10px] font-medium text-slate-400">
            Bản quyền thuộc về Trần Nam Long — VDB Chi nhánh KV Bắc Đông Bắc, PGD Cao Bằng
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar bg-slate-50/50">
        
        {/* THANH CÔNG CỤ */}
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex-1 max-w-[150px]">
            <InputField label="Ngày hiệu lực" value={formData.date} onChange={v => updateField('date', v)} placeholder="DD/MM/YYYY" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleNewForm} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all">✨ MỚI</button>
            <button onClick={handleSetDefault} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-800 hover:text-white transition-all">🏠 GỐC</button>
          </div>
        </div>

        {/* SECTION: BÊN TRẢ TIỀN */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-2">Thông tin tài khoản nợ</h3>
          <InputField label="Đơn vị trả tiền" value={formData.payerName} onChange={v => updateField('payerName', v)} />
          <InputField label="Địa chỉ" value={formData.payerAddress} onChange={v => updateField('payerAddress', v)} />
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Số tài khoản" value={formData.payerAccount} onChange={v => updateField('payerAccount', v)} mono />
            <InputField label="Tại ngân hàng" value={formData.payerBank} onChange={v => updateField('payerBank', v)} />
          </div>
        </div>

        {/* SECTION: SỐ TIỀN & PHÍ - Đã tinh chỉnh để hòa hợp hơn */}
        <div className="bg-white p-6 rounded-[24px] border-2 border-bidv-blue/20 shadow-lg shadow-bidv-blue/5 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5 text-bidv-blue font-black text-4xl select-none">VND</div>
          <InputField label="Số tiền thanh toán" value={displayAmount} onChange={handleAmountChange} placeholder="0" mono />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bằng chữ</label>
            <div className="text-[12px] text-bidv-blue font-bold italic bg-slate-50/80 p-3 rounded-xl border border-dashed border-slate-200 leading-relaxed min-h-[44px]">
              {formData.amountWords || <span className="opacity-30 font-normal">Chờ nhập số tiền...</span>}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phương thức thu phí</label>
            <div className="grid grid-cols-1 gap-1.5">
              {[{id:'deduct', l:'Phí khấu trừ vào số tiền chuyển'}, {id:'cash', l:'Phí thu bằng tiền mặt'}, {id:'account', l:'Phí trích từ tài khoản'}].map(ft => (
                <div key={ft.id} onClick={() => updateField('feeType', ft.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${formData.feeType === ft.id ? 'bg-bidv-blue/5 border-bidv-blue text-bidv-blue' : 'bg-transparent border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${formData.feeType === ft.id ? 'border-bidv-blue' : 'border-slate-300'}`}>
                    {formData.feeType === ft.id && <div className="w-1.5 h-1.5 rounded-full bg-bidv-blue" />}
                  </div>
                  <span className={`text-[11px] ${formData.feeType === ft.id ? 'font-bold' : 'font-medium'}`}>{ft.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: NGƯỜI HƯỞNG */}
        <div className="bg-white p-6 rounded-[24px] border border-emerald-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-l-2 border-emerald-400 pl-2">Thông tin thụ hưởng</h3>
            <div className="flex gap-1.5">
              <button onClick={handleSaveBeneficiary} className="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm">💾</button>
              <button onClick={() => setShowPicker(true)} className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-bidv-blue hover:text-white transition-all shadow-sm">📖</button>
              <button onClick={() => setShowHistory(true)} className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all shadow-sm">⌛</button>
            </div>
          </div>
          <InputField label="Họ tên người nhận" value={formData.beneficiaryName} onChange={v => updateField('beneficiaryName', v)} />
          <div className="grid grid-cols-2 gap-6">
            <InputField label="Số tài khoản" value={formData.beneficiaryAccount} onChange={v => updateField('beneficiaryAccount', v)} mono />
            <InputField label="Tại ngân hàng" value={formData.beneficiaryBank} onChange={v => updateField('beneficiaryBank', v)} />
          </div>
          <InputField label="Địa chỉ" value={formData.beneficiaryAddress} onChange={v => updateField('beneficiaryAddress', v)} />
          <div className="pt-3 border-t border-slate-50 grid grid-cols-1 gap-4">
            <InputField label="Số CCCD/Hộ chiếu" value={formData.beneficiaryCCCD}
