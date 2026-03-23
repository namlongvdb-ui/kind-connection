import jsPDF from 'jspdf';

/**
 * Hàm xuất PDF chuyên nghiệp cho BIDV - Tốc độ tức thì
 */
export async function exportUNCToPDF(formData: any) {
  // Tạo tài liệu A4, đơn vị mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // 1. VẼ LOGO TẠM THỜI (Hình chữ nhật xanh BIDV)
  pdf.setFillColor(0, 102, 178); 
  pdf.rect(15, 10, 45, 12, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text("BIDV CAO BANG", 18, 18);
  
  // Đặt lại màu chữ đen
  pdf.setTextColor(0, 0, 0);

  // 2. TIÊU ĐỀ (Không dấu để tránh lỗi font hệ thống)
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("UY NHIEM CHI", 105, 20, { align: "center" });
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Ngay (Date): ${formData.date || '.../.../2026'}`, 105, 26, { align: "center" });

  // 3. KHUNG CHỨA NỘI DUNG
  pdf.setLineWidth(0.2);
  pdf.rect(10, 35, 190, 50); // Khung bên trả tiền
  pdf.rect(10, 90, 190, 60); // Khung người hưởng

  // 4. THÔNG TIN BÊN TRẢ TIỀN
  pdf.setFont("helvetica", "bold");
  pdf.text("DON VI TRA TIEN (PAYER):", 15, 42);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Ten (Name): ${formData.payerName || ''}`, 15, 50);
  pdf.text(`STK (A/C No): ${formData.payerAccount || ''}`, 15, 57);
  pdf.text(`Tại (At Bank): ${formData.payerBank || ''}`, 15, 64);

  // 5. SỐ TIỀN
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  const amt = formData.amount ? Number(formData.amount).toLocaleString('vi-VN') : '0';
  pdf.text(`SO TIEN (AMOUNT): ${amt} VND`, 130, 50);

  // 6. THÔNG TIN NGƯỜI HƯỞNG
  pdf.setFontSize(10);
  pdf.text("DON VI THU HUONG (BENEFICIARY):", 15, 97);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Ten: ${formData.beneficiaryName || ''}`, 15, 105);
  pdf.text(`STK: ${formData.beneficiaryAccount || ''}`, 15, 112);
  pdf.text(`Tai: ${formData.beneficiaryBank || ''}`, 15, 119);
  
  // 7. NỘI DUNG
  pdf.text(`Noi dung (Remarks): ${formData.remarks || ''}`, 15, 135);

  // 8. CHỮ KÝ
  const ySig = 175;
  pdf.setFont("helvetica", "bold");
  pdf.text("KE TOAN TRUONG", 45, ySig, { align: "center" });
  pdf.text("CHU TAI KHOAN", 155, ySig, { align: "center" });

  // XUẤT FILE
  const safeName = (formData.beneficiaryName || 'UNC').replace(/\s+/g, '_');
  pdf.save(`UNC_${safeName}.pdf`);
}
