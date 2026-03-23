import jsPDF from 'jspdf';

/**
 * Hàm xuất PDF chuyên nghiệp cho BIDV
 * Ưu điểm: Tốc độ tức thì, chữ sắc nét, không phụ thuộc trình duyệt
 */
export async function exportUNCToPDF(formData: any) {
  // Tạo tài liệu A4, đơn vị mm
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // 1. CHÈN LOGO BIDV (Dạng Base64 để đảm bảo luôn hiển thị)
  // Bạn có thể thay chuỗi này bằng mã Base64 logo thực tế của PGD Cao Bằng
  const logoBIDV = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA... (chuỗi mã hóa logo)";
  
  try {
    // Thêm logo vào góc trên bên trái
    pdf.addImage(logoBIDV, 'PNG', 15, 10, 45, 12); 
  } catch (e) {
    console.warn("Không chèn được logo, tiếp tục xuất nội dung văn bản.");
  }

  // 2. THIẾT LẬP FONT CHỮ VÀ TIÊU ĐỀ
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("UY NHIEM CHI", 105, 20, { align: "center" });
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Ngay (Date): ${formData.date || '.../.../2026'}`, 105, 26, { align: "center" });

  // 3. VẼ CÁC ĐƯỜNG KẺ KHUNG (Giống mẫu phôi BIDV)
  pdf.setLineWidth(0.2);
  pdf.rect(10, 35, 190, 50); // Khung bên trả tiền
  pdf.rect(10, 90, 190, 60); // Khung bên thụ hưởng

  // 4. ĐIỀN THÔNG TIN BÊN TRẢ TIỀN
  pdf.setFont("helvetica", "bold");
  pdf.text("PHAN DANH CHO NGAN HANG GHI", 15, 42);
  
  pdf.setFont("helvetica", "normal");
  pdf.text(`Don vi tra tien: ${formData.payerName}`, 15, 50);
  pdf.text(`So tai khoan: ${formData.payerAccount}`, 15, 57);
  pdf.text(`Tai ngan hang: ${formData.payerBank}`, 15, 64);

  // 5. ĐIỀN THÔNG TIN SỐ TIỀN
  pdf.setFont("helvetica", "bold");
  pdf.text(`SO TIEN: ${formData.amount || 0} VND`, 150, 50);

  // 6. ĐIỀN THÔNG TIN NGƯỜI HƯỞNG
  pdf.text("DON VI THU HUONG", 15, 97);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Ten nguoi huong: ${formData.beneficiaryName}`, 15, 105);
  pdf.text(`So tai khoan: ${formData.beneficiaryAccount}`, 15, 112);
  pdf.text(`Tai ngan hang: ${formData.beneficiaryBank}`, 15, 119);
  
  // 7. NỘI DUNG THANH TOÁN
  pdf.text(`Noi dung: ${formData.remarks}`, 15, 135);

  // 8. PHẦN CHỮ KÝ
  const ySig = 160;
  pdf.setFont("helvetica", "bold");
  pdf.text("KE TOAN TRUONG", 30, ySig);
  pdf.text("CHU TAI KHOAN", 150, ySig);

  // XUẤT FILE
  const fileName = `UNC_${formData.beneficiaryName || 'BIDV'}_${new Date().getTime()}.pdf`;
  pdf.save(fileName);
}
