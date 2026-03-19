import { UNCFormData } from '@/hooks/useUNCForm';
import { formatCurrency } from '@/lib/numberToWords';
import bidvWatermark from '@/assets/bidv-watermark.jpg';

interface Props {
  formData: UNCFormData;
}

const DottedValue = ({ value, mono }: { value: string; mono?: boolean }) => (
  <span className={`border-b border-dotted border-ink/30 flex-1 pb-0.5 min-h-[1.2em] ${mono ? 'font-mono tracking-[0.12em]' : ''}`}>
    {value || '\u00A0'}
  </span>
);

const FieldRow = ({ label, sublabel, value, mono }: { label: string; sublabel: string; value: string; mono?: boolean }) => (
  <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
    <span className="font-bold whitespace-nowrap text-ink" style={{ fontSize: '9.5pt' }}>{label}</span>
    <span className="italic text-ink/50 whitespace-nowrap" style={{ fontSize: '8pt' }}>/{sublabel}:</span>
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
        {/* Watermark - full background like the original template */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <img src={bidvWatermark} alt="" className="w-full h-full object-cover" style={{ opacity: 1 }} />
        </div>

        {/* Content */}
        <div className="relative" style={{ zIndex: 1, padding: '8mm 12mm 10mm 12mm' }}>
          {/* Header - logo is already in watermark image, just add title */}
          <div className="flex items-start justify-center mb-0" style={{ paddingTop: '14mm' }}>
            <div className="text-center">
              <h1 className="font-bold text-bidv-blue leading-tight tracking-wide" style={{ fontSize: '15pt' }}>ỦY NHIỆM CHI</h1>
              <p className="italic text-ink/50" style={{ fontSize: '9pt' }}>PAYMENT ORDER</p>
            </div>
          </div>

          {/* Date */}
          <div className="text-right mb-2" style={{ marginTop: '3mm' }}>
            <span className="font-bold text-ink" style={{ fontSize: '9.5pt' }}>Ngày</span>
            <span className="italic text-ink/50" style={{ fontSize: '8pt' }}>/Date: </span>
            <span className="font-bold" style={{ fontSize: '9.5pt' }}>{formData.date}</span>
          </div>

          {/* Payer Section */}
          <div className="space-y-[1px] mb-1.5">
            <FieldRow label="Tên tài khoản trích nợ" sublabel="Dr A/C name" value={formData.payerName} />
            <FieldRow label="Địa chỉ" sublabel="Address" value={formData.payerAddress} />
            <FieldRow label="Số tài khoản trích nợ" sublabel="Dr A/C No" value={formData.payerAccount} mono />
            <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.payerBank} />
          </div>

          {/* Amount */}
          <div className="space-y-[1px] mb-1.5" style={{ marginTop: '2mm' }}>
            <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
              <span className="font-bold whitespace-nowrap" style={{ fontSize: '9.5pt' }}>Số tiền bằng số</span>
              <span className="italic text-ink/50 whitespace-nowrap" style={{ fontSize: '8pt' }}>/Amount in figures:</span>
              <span className="font-bold font-mono tracking-wider flex-1" style={{ fontSize: '11pt' }}>{displayAmount}</span>
              {displayAmount && <span className="font-bold" style={{ fontSize: '9.5pt' }}>VNĐ</span>}
            </div>
            <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
              <span className="font-bold whitespace-nowrap" style={{ fontSize: '9.5pt' }}>Số tiền bằng chữ</span>
              <span className="italic text-ink/50 whitespace-nowrap" style={{ fontSize: '8pt' }}>/Amount in words:</span>
              <DottedValue value={formData.amountWords} />
            </div>
          </div>

          {/* Exchange & Fee */}
          <div className="space-y-[1px] mb-1.5" style={{ fontSize: '9pt', marginTop: '1mm' }}>
            <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
              <span className="font-bold whitespace-nowrap">Đề nghị quy đổi ra</span>
              <span className="italic text-ink/50" style={{ fontSize: '7.5pt' }}>/Request for changing into:</span>
              <DottedValue value="" />
              <span className="font-bold whitespace-nowrap ml-1">Tỷ giá</span>
              <span className="italic text-ink/50" style={{ fontSize: '7.5pt' }}>/Ex rate:</span>
              <DottedValue value="" />
            </div>
            <div className="flex gap-3 items-center" style={{ lineHeight: '1.8' }}>
              <span>
                <Checkbox checked={formData.feeType === 'deduct'} />
                <span className="font-bold">Phí trong số tiền chuyển</span>
                <span className="italic text-ink/50" style={{ fontSize: '7.5pt' }}>/Deduct</span>
              </span>
              <span>
                <Checkbox checked={formData.feeType === 'cash'} />
                <span className="font-bold">Phí thu từ tiền mặt</span>
                <span className="italic text-ink/50" style={{ fontSize: '7.5pt' }}>/Fee in cash</span>
              </span>
            </div>
            <div style={{ lineHeight: '1.8' }}>
              <Checkbox checked={formData.feeType === 'account'} />
              <span className="font-bold">Phí thu từ tài khoản</span>
              <span className="italic text-ink/50" style={{ fontSize: '7.5pt' }}>/Fee collected from A/C:</span>
            </div>
          </div>

          {/* Beneficiary Section */}
          <div className="space-y-[1px] mb-1.5" style={{ marginTop: '2mm' }}>
            <FieldRow label="Người hưởng" sublabel="Beneficiary" value={formData.beneficiaryName} />
            <div className="flex gap-3">
              <div className="flex gap-1.5 items-baseline flex-1" style={{ lineHeight: '1.8' }}>
                <span className="font-bold whitespace-nowrap" style={{ fontSize: '9.5pt' }}>Số CCCD/HC</span>
                <span className="italic text-ink/50" style={{ fontSize: '8pt' }}>/ID No:</span>
                <DottedValue value={formData.beneficiaryCCCD} mono />
              </div>
              <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
                <span className="font-bold whitespace-nowrap" style={{ fontSize: '9.5pt' }}>Ngày cấp</span>
                <span className="italic text-ink/50" style={{ fontSize: '8pt' }}>/Date:</span>
                <DottedValue value={formData.cccdDate} />
              </div>
            </div>
            <div className="flex gap-1.5 items-baseline" style={{ lineHeight: '1.8' }}>
              <span className="font-bold whitespace-nowrap" style={{ fontSize: '9.5pt' }}>Nơi cấp</span>
              <span className="italic text-ink/50" style={{ fontSize: '8pt' }}>/Place:</span>
              <DottedValue value={formData.cccdPlace} />
            </div>
            <FieldRow label="Địa chỉ" sublabel="Address" value={formData.beneficiaryAddress} />
            <FieldRow label="Số tài khoản" sublabel="Ben's A/C No" value={formData.beneficiaryAccount} mono />
            <FieldRow label="Tại Ngân hàng" sublabel="At Bank" value={formData.beneficiaryBank} />
          </div>

          {/* Remarks */}
          <div className="mb-3" style={{ marginTop: '2mm' }}>
            <FieldRow label="Nội dung" sublabel="Remarks" value={formData.remarks} />
          </div>

          {/* Confirmation text */}
          <p className="italic text-ink/60 text-center" style={{ fontSize: '8pt', marginTop: '3mm', marginBottom: '4mm' }}>
            <span className="font-bold not-italic text-ink" style={{ fontSize: '8.5pt' }}>Khách hàng xác nhận các thông tin trên là chính xác</span>
            <br />
            <span>Please sign to confirm the above information is accurate</span>
          </p>

          {/* Signatures */}
          <div className="grid grid-cols-[1fr_1fr_1px_1fr_1fr] gap-x-3 text-center" style={{ fontSize: '8pt', marginTop: '2mm' }}>
            <div>
              <p className="font-bold uppercase" style={{ fontSize: '8.5pt' }}>Kế toán trưởng</p>
              <p className="italic text-ink/40" style={{ fontSize: '7pt' }}>Chief Accountant</p>
              <p className="italic text-ink/30 mt-0.5" style={{ fontSize: '6.5pt' }}>(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/30" style={{ fontSize: '6.5pt' }}>Signature & full name</p>
              <div style={{ height: '55px' }} />
            </div>
            <div>
              <p className="font-bold uppercase" style={{ fontSize: '8.5pt' }}>Chủ tài khoản</p>
              <p className="italic text-ink/40" style={{ fontSize: '7pt' }}>Accountholder</p>
              <p className="italic text-ink/30 mt-0.5" style={{ fontSize: '6.5pt' }}>(Ký và ghi rõ họ tên)</p>
              <p className="italic text-ink/30" style={{ fontSize: '6.5pt' }}>Signature & full name</p>
              <div style={{ height: '55px' }} />
            </div>
            <div className="bg-ink/10" />
            <div>
              <p className="font-bold uppercase" style={{ fontSize: '8.5pt' }}>Giao dịch viên</p>
              <p className="italic text-ink/40" style={{ fontSize: '7pt' }}>Teller</p>
              <div style={{ height: '65px' }} />
            </div>
            <div>
              <p className="font-bold uppercase" style={{ fontSize: '8.5pt' }}>Kiểm soát viên</p>
              <p className="italic text-ink/40" style={{ fontSize: '7pt' }}>Supervisor</p>
              <div style={{ height: '65px' }} />
            </div>
          </div>

          {/* Thank you message */}
          <div className="text-center italic text-ink/35" style={{ fontSize: '7.5pt', marginTop: '6mm' }}>
            <p>Cảm ơn quý khách hàng đã sử dụng dịch vụ của BIDV</p>
            <p>Thank you for using BIDV's services</p>
          </div>
        </div>
      </div>
    </main>
  );
}
