import { UNCFormData } from '@/hooks/useUNCForm';
import { formatCurrency } from '@/lib/numberToWords';
import bidvWatermark from '@/assets/bidv-watermark.jpg';

interface Props {
  formData: UNCFormData;
}

const DottedValue = ({ value, mono }: { value: string; mono?: boolean }) => (
  <span className={`flex-1 pb-0.5 min-h-[1.2em] break-words overflow-wrap-anywhere ${mono ? 'font-mono tracking-[0.12em]' : ''}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
    {value || '\u00A0'}
  </span>
);

const FieldRow = ({ label, sublabel, value, mono }: { label: string; sublabel: string; value: string; mono?: boolean }) => (
  <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
    <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>{label}</span>
    <span className="italic text-ink whitespace-nowrap" style={{ fontSize: '8pt' }}>/{sublabel}:</span>
    <DottedValue value={value} mono={mono} />
  </div>
);

const Checkbox = ({ checked }: { checked: boolean }) => (
  <span className="inline-block w-[11px] h-[11px] border border-ink/50 align-middle mr-1 relative" style={{ marginBottom: '1px' }}>
    {checked && <span className="absolute inset-0 flex items-center justify-center leading-none font-bold text-ink" style={{ fontSize: '9px' }}>✓</span>}
  </span>
);

export default function UNCPreview({ formData }: Props) {
  const displayAmount = formData.amount ? formatCurrency(parseInt(formData.amount)) : '';

  return (
    <main className="flex-1 overflow-auto p-6 flex justify-center items-start bg-desk min-h-0">
      <div
        id="unc-paper"
        className="relative bg-paper shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] origin-top"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: '"Be Vietnam Pro", sans-serif',
          fontSize: '9.5pt',
          color: 'hsl(0 0% 12%)',
          lineHeight: '1.7',
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <img src={bidvWatermark} alt="" className="w-full h-full object-cover" style={{ opacity: 1 }} />
        </div>

        {/* Content */}
        <div className="relative" style={{ zIndex: 1, padding: '8mm 12mm 10mm 12mm' }}>
          {/* Header */}
          <div className="flex items-start justify-center mb-0" style={{ paddingTop: '8mm' }}>
            <div className="text-center">
              <h1 className="font-bold text-bidv-blue leading-tight tracking-wide" style={{ fontSize: '18pt', fontFamily: 'Roboto, sans-serif' }}>ỦY NHIỆM CHI</h1>
              <p className="italic text-bidv-blue" style={{ fontSize: '13pt', fontFamily: 'Roboto, sans-serif', lineHeight: '1.1', marginTop: '0mm' }}>PAYMENT ORDER</p>
            </div>
          </div>

          {/* Bordered content area */}
          <div style={{ marginTop: '3mm' }}>
            {/* Date */}
            <div className="text-right" style={{ padding: '1mm 3mm' }}>
              <span className="font-bold text-bidv-blue" style={{ fontSize: '9.5pt' }}>Ngày</span>
              <span className="italic text-ink" style={{ fontSize: '8pt' }}>/Date: </span>
              <span className="font-bold" style={{ fontSize: '9.5pt' }}>{formData.date}</span>
            </div>

            {/* Payer Section */}
            <div className="space-y-[1px] border-l border-r border-ink/40" style={{ borderBottom: '1px solid hsl(0 0% 12% / 0.4)', borderTop: '1px solid hsl(0 0% 12% / 0.4)', padding: '0 3mm 1mm 3mm' }}>
              <div className="bg-bidv-blue/15 -mx-[3mm] px-[3mm] py-[0.5mm] -mt-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as React.CSSProperties}>
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

            {/* Amount + Exchange & Fee */}
            <div className="space-y-[1px] border-l border-r border-ink/40" style={{ borderBottom: '1px solid hsl(0 0% 12% / 0.4)', padding: '1mm 3mm' }}>
              <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
                <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Số tiền bằng số</span>
                <span className="italic text-ink whitespace-nowrap" style={{ fontSize: '8pt' }}>/Amount in figures:</span>
                <span className="font-bold font-mono tracking-wider flex-1" style={{ fontSize: '11pt' }}>{displayAmount}</span>
                {displayAmount && <span className="font-bold" style={{ fontSize: '9.5pt' }}>VNĐ</span>}
              </div>
              <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
                <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Số tiền bằng chữ</span>
                <span className="italic text-ink whitespace-nowrap" style={{ fontSize: '8pt' }}>/Amount in words:</span>
                <span className="flex-1 pb-0.5 min-h-[1.2em]" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{formData.amountWords || '\u00A0'}</span>
              </div>
              <div className="flex gap-3 items-baseline" style={{ lineHeight: '1.8', fontSize: '9pt' }}>
   <div className="flex gap-1 items-baseline">
    <span className="font-bold whitespace-nowrap text-bidv-blue">Đề nghị quy đổi ra</span>
    <span className="italic text-ink text-[7.5pt]">/Request for changing into:</span>
    <DottedValue value={formData.exchangeTo} />
  </div>
  <div className="flex gap-1.5 items-baseline">
    <span className="font-bold whitespace-nowrap text-bidv-blue">Tỷ giá</span>
    <span className="italic text-ink text-[7.5pt]">/Ex rate:</span>
    <DottedValue value={formData.exchangeRate} />
  </div>
  </div>
              <div className="flex gap-4 items-center" style={{ lineHeight: '1.8' }}>
                <span>
                  <Checkbox checked={formData.feeType === 'deduct'} />
                  <span className="font-bold text-bidv-blue">Phí trong số tiền chuyển</span>
                  <span className="italic text-ink" style={{ fontSize: '7.5pt' }}>/Deduct</span>
                </span>
                <span>
                  <Checkbox checked={formData.feeType === 'cash'} />
                  <span className="font-bold text-bidv-blue">Phí thu từ tiền mặt</span>
                  <span className="italic text-ink" style={{ fontSize: '7.5pt' }}>/Fee in cash</span>
                </span>
              </div>
              <div style={{ lineHeight: '1.8' }}>
                <span>
                  <Checkbox checked={formData.feeType === 'account'} />
                  <span className="font-bold text-bidv-blue">Phí thu từ tài khoản</span>
                  <span className="italic text-ink" style={{ fontSize: '7.5pt' }}>/Fee collected from A/C:</span>
                </span>
              </div>
            </div>

            {/* Beneficiary Section */}
            <div className="space-y-[1px] border-l border-r border-ink/40" style={{ borderBottom: '1px solid hsl(0 0% 12% / 0.4)', padding: '1mm 3mm' }}>
              <FieldRow label="Người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} />
              <div className="flex gap-3">
                <div className="flex gap-1.5 items-baseline flex-1" style={{ lineHeight: '1.8' }}>
                  <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Số CCCD/HC</span>
                  <span className="italic text-ink" style={{ fontSize: '8pt' }}>/ID No:</span>
                  <DottedValue value={formData.beneficiaryCCCD} mono />
                </div>
                <div className="flex gap-1.5 items-baseline flex-1" style={{ lineHeight: '1.8' }}>
                  <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Ngày cấp</span>
                  <span className="italic text-ink" style={{ fontSize: '8pt' }}>/Date:</span>
                  <DottedValue value={formData.cccdDate} />
                </div>
              </div>
              <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
                <span className="font-bold whitespace-nowrap text-bidv-blue" style={{ fontSize: '9.5pt' }}>Nơi cấp</span>
                <span className="italic text-ink" style={{ fontSize: '8pt' }}>/Place:</span>
                <DottedValue value={formData.cccdPlace} />
              </div>
              <FieldRow label="Địa chỉ" sublabel="Address" value={formData.beneficiaryAddress} />
              <FieldRow label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} mono />
              <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} />
            </div>

            {/* Remarks */}
            <div className="border-l border-r border-b border-ink/40" style={{ padding: '1mm 3mm' }}>
              <FieldRow label="Nội dung" sublabel="Remarks" value={formData.remarks} />
              
            </div>
          </div>

          {/* Confirmation text */}
          <p className="text-center" style={{ fontSize: '8pt', marginTop: '3mm', marginBottom: '4mm' }}>
            <span className="font-bold text-bidv-blue" style={{ fontSize: '8.5pt' }}>Khách hàng xác nhận các thông tin trên là chính xác</span>
            <span className="italic text-ink" style={{ fontSize: '8pt' }}> / Please sign to confirm the above information is accurate</span>
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-x-3 text-center" style={{ fontSize: '8pt', marginTop: '2mm' }}>
            <div>
              <p className="font-bold uppercase text-bidv-blue" style={{ fontSize: '8.5pt' }}>Kế toán trưởng</p>
              <p className="italic text-ink" style={{ fontSize: '7pt' }}>Chief Accountant</p>
              <p className="italic text-ink/50 mt-0.5" style={{ fontSize: '6.5pt' }}>(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/50" style={{ fontSize: '6.5pt' }}>Signature & full name</p>
              <div style={{ height: '55px' }}></div>
            </div>
            <div>
              <p className="font-bold uppercase text-bidv-blue" style={{ fontSize: '8.5pt' }}>Chủ tài khoản</p>
              <p className="italic text-ink" style={{ fontSize: '7pt' }}>Accountholder</p>
              <p className="italic text-ink/50 mt-0.5" style={{ fontSize: '6.5pt' }}>(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/50" style={{ fontSize: '6.5pt' }}>Signature & full name</p>
              <div style={{ height: '55px' }}></div>
            </div>
            <div>
              <p className="font-bold uppercase text-bidv-blue" style={{ fontSize: '8.5pt' }}>Giao dịch viên</p>
              <p className="italic text-ink" style={{ fontSize: '7pt' }}>Teller</p>
              <div style={{ height: '65px' }}></div>
            </div>
            <div>
              <p className="font-bold uppercase text-bidv-blue" style={{ fontSize: '8.5pt' }}>Kiểm soát viên</p>
              <p className="italic text-ink" style={{ fontSize: '7pt' }}>Supervisor</p>
              <div style={{ height: '65px' }}></div>
            </div>
          </div>

          {/* Thank you message */}
          <div style={{ height: '1.8em' }}></div>
          <div className="text-center" style={{ fontSize: '7.5pt', marginTop: '60mm' }}>
            <p className="font-bold text-bidv-blue">Cảm ơn quý khách hàng đã sử dụng dịch vụ của BIDV</p>
            <p className="italic text-ink">Thank you for using BIDV's services</p>
          </div>
        </div>
      </div>
    </main>
  );
}
