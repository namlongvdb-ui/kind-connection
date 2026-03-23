import { UNCFormData } from '@/hooks/useUNCForm';
import { formatCurrency } from '@/lib/numberToWords';
import bidvWatermark from '@/assets/bidv-watermark.jpg';

interface Props {
  formData: UNCFormData;
}

const FieldRow = ({ label, sublabel, value, mono, className = "" }: { label: string; sublabel: string; value: string; mono?: boolean, className?: string }) => (
  <div className={`block w-full ${className}`} style={{ lineHeight: '1.8', marginBottom: '1px' }}>
    <span className="font-bold text-bidv-blue mr-1" style={{ fontSize: '9.5pt' }}>{label}</span>
    <span className="italic text-ink mr-2" style={{ fontSize: '8pt' }}>/{sublabel}:</span>
    <span className={`${mono ? 'font-mono tracking-wider' : ''} break-words`} style={{ fontSize: mono ? '10.5pt' : '9.5pt' }}>
      {value || '\u00A0'}
    </span>
  </div>
);

const Checkbox = ({ checked }: { checked: boolean }) => (
  <span className="inline-block w-[12px] h-[12px] border border-ink/50 align-middle mr-1 relative bg-white" style={{ marginBottom: '2px' }}>
    {checked && <span className="absolute inset-0 flex items-center justify-center leading-none font-bold text-ink" style={{ fontSize: '10px' }}>✓</span>}
  </span>
);

export default function UNCPreview({ formData }: Props) {
  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <main className="flex-1 overflow-auto p-6 flex justify-center items-start bg-desk min-h-0">
      <div
        id="unc-paper"
        className="relative bg-paper shadow-2xl origin-top"
        style={{
          width: '210mm',
          height: '297mm',
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: '9.5pt',
          color: 'hsl(0 0% 12%)',
          lineHeight: '1.6',
        }}
      >
        {/* WATERMARK CẢI TIẾN: Phủ kín 100% trang, không bị trắng đầu trang */}
<div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
  <img 
    src={bidvWatermark} 
    alt="" 
    className="w-full h-full object-cover opacity-100" 
    style={{ 
      // Phóng lớn ảnh 1.1 lần để có phần dư lấp đầy khoảng trắng khi dịch chuyển
      transform: 'scale(1.1)', 
      // Dịch chuyển tâm ảnh xuống dưới để bông hoa không đè lên chữ tiêu đề
      objectPosition: 'center 60px' 
    }} 
  />
</div>
        {/* Content Area */}
        <div className="relative h-full" style={{ zIndex: 1, padding: '10mm 15mm' }}>
          
          {/* Header */}
          <div className="text-center mb-4 pt-6">
            <h1 className="font-bold text-bidv-blue tracking-widest uppercase" style={{ fontSize: '20pt' }}>Ủy nhiệm chi</h1>
            <p className="italic text-bidv-blue font-medium" style={{ fontSize: '14pt', marginTop: '-2mm' }}>PAYMENT ORDER</p>
          </div>

          <div className="text-right mb-2">
            <span className="font-bold text-bidv-blue">Ngày</span>
            <span className="italic text-ink">/Date: </span>
            <span className="font-bold px-2">{formData.date || '    /    /202  '}</span>
          </div>

          {/* Bordered Box */}
          <div className="border border-ink/40 w-full">
            
            {/* 1. Phần trả tiền */}
            <div className="space-y-[1px] border-l border-r border-ink/40" style={{ borderBottom: '1px solid hsl(0 0% 12% / 0.4)', borderTop: '1px solid hsl(0 0% 12% / 0.4)', padding: '0 3mm 1mm 3mm' }}>
              <div className="bg-bidv-blue/10 -mx-[3mm] px-[3mm] py-[0.5mm] -mt-0">
                <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
                  <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Tên tài khoản trích nợ</span>
                  <span className="italic text-ink whitespace-nowrap" style={{ fontSize: '8pt' }}>/Dr A/C name:</span>
                </div>
                <div style={{ minHeight: '1.6em', lineHeight: '1.8' }}>{formData.payerName || '\u00A0'}</div>
              </div>
              <FieldRow label="Địa chỉ" sublabel="Address" value={formData.payerAddress} />
              <FieldRow label="Số tài khoản trích nợ" sublabel="Dr A/C No" value={formData.payerAccount} mono />
              <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.payerBank} />
            </div>

            {/* 2. Số tiền & Quy đổi & Phí */}
            <div className="p-3 border-b border-ink/40">
              <div className="flex items-baseline flex-wrap">
                <span className="font-bold text-bidv-blue mr-1" style={{ fontSize: '9.5pt' }}>Số tiền bằng số</span>
                <span className="italic text-ink mr-2" style={{ fontSize: '8pt' }}>/Amount in figures:</span>
                <div className="inline-flex items-baseline gap-2">
                  <span className="font-bold font-mono text-[12pt] tracking-wider text-black">
                    {displayAmount || ''}
                  </span>
                  {displayAmount && <span className="font-bold text-black" style={{ fontSize: '10pt' }}>VNĐ</span>}
                </div>
              </div>

              <div className="block w-full mt-1" style={{ lineHeight: '1.8' }}>
                <span className="font-bold text-bidv-blue mr-1" style={{ fontSize: '9.5pt' }}>Số tiền bằng chữ</span>
                <span className="italic text-ink mr-2" style={{ fontSize: '8pt' }}>/Amount in words:</span>
                <span className="break-words leading-relaxed italic" style={{ fontSize: '9.5pt' }}>
                  {formData.amountWords || ''}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-8 mt-2">
                <div className="inline-block">
                  <span className="font-bold text-bidv-blue">Đề nghị quy đổi ra</span>
                  <span className="italic text-ink text-[8pt]">/Request for changing into:</span>
                  <span className="ml-2 font-bold">{formData.exchangeTo || '\u00A0'}</span>
                </div>
                <div className="inline-block">
                  <span className="font-bold text-bidv-blue">Tỷ giá</span>
                  <span className="italic text-ink text-[8pt]">/Ex rate:</span>
                  <span className="ml-2 font-bold">{formData.exchangeRate || '\u00A0'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-[8.5pt]">
                <div className="flex items-center"><Checkbox checked={formData.feeType === 'deduct'} /> <span className="font-bold text-bidv-blue">Phí trong số tiền chuyển</span><span className="italic ml-1">/Deduct</span></div>
                <div className="flex items-center"><Checkbox checked={formData.feeType === 'cash'} /> <span className="font-bold text-bidv-blue">Phí thu từ tiền mặt</span><span className="italic ml-1">/Fee in cash</span></div>
                <div className="flex items-center"><Checkbox checked={formData.feeType === 'account'} /> <span className="font-bold text-bidv-blue">Phí thu từ tài khoản</span><span className="italic ml-1">/Fee collected from A/C</span></div>
              </div>
            </div>

            {/* 3. Người hưởng */}
            <div className="p-3 border-b border-ink/40">
              <FieldRow label="Người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} />
              <div className="grid grid-cols-2 gap-4">
                <FieldRow label="Số CCCD/HC" sublabel="ID No" value={formData.beneficiaryCCCD} mono />
                <FieldRow label="Ngày cấp" sublabel="Date" value={formData.cccdDate} />
              </div>
              <FieldRow label="Nơi cấp" sublabel="Place" value={formData.cccdPlace} />
              <FieldRow label="Địa chỉ" sublabel="Address" value={formData.beneficiaryAddress} />
              <FieldRow label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} mono />
              <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} />
            </div>

            {/* 4. Nội dung */}
            <div className="p-3">
              <div className="block w-full" style={{ lineHeight: '1.8' }}>
                <span className="font-bold text-bidv-blue mr-1">Nội dung</span>
                <span className="italic text-ink mr-2">/Remarks:</span>
                <span className="break-words leading-relaxed text-sm uppercase">{formData.remarks || '\u00A0'}</span>
              </div>
            </div>
          </div>

          {/* Cam kết & Chữ ký */}
          <p className="text-center text-[8pt] my-4 italic">
            <span className="font-bold text-bidv-blue not-italic">Khách hàng xác nhận các thông tin trên là chính xác</span> / Please sign to confirm the above information is accurate
          </p>

          <div className="grid grid-cols-4 gap-2 text-center mt-6">
            <div>
              <p className="font-bold text-bidv-blue text-[9pt] uppercase">Kế toán trưởng</p>
              <p className="text-[7pt] italic text-ink leading-tight">Chief Accountant</p>
              <p className="text-[6.5pt] text-ink/50 mt-1">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-bidv-blue text-[9pt] uppercase">Chủ tài khoản</p>
              <p className="text-[7pt] italic text-ink leading-tight">Accountholder</p>
              <p className="text-[6.5pt] text-ink/50 mt-1">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-bold text-bidv-blue text-[9pt] uppercase">Giao dịch viên</p>
              <p className="text-[7pt] italic text-ink leading-tight">Teller</p>
            </div>
            <div>
              <p className="font-bold text-bidv-blue text-[9pt] uppercase">Kiểm soát viên</p>
              <p className="text-[7pt] italic text-ink leading-tight">Supervisor</p>
            </div>
          </div>

          {/* Chân trang */}
          <div 
            className="absolute left-0 right-0 text-center" 
            style={{ bottom: '15mm' }}
          >
            <div className="inline-block w-[80%] pt-2">
              <p className="font-bold text-bidv-blue" style={{ fontSize: '9pt' }}>
                Cảm ơn quý khách hàng đã sử dụng dịch vụ của BIDV
              </p>
              <p className="italic text-ink" style={{ fontSize: '7.5pt' }}>
                Thank you for using BIDV's services
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
