import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper');
  if (!element) {
    alert("Không tìm thấy vùng dữ liệu 'unc-paper' để xuất PDF!");
    return;
  }

  try {
    // 1. Ép kích thước ảo cho trình chụp ảnh (WindowWidth = 210mm ~ 794px)
    // Điều này đảm bảo dù màn hình Laptop tại PGD Cao Bằng bị thu nhỏ, 
    // canvas vẫn vẽ dựa trên khổ giấy đầy đủ.
    const canvas = await html2canvas(element, {
      scale: 3, // Giữ độ nét cao để in ấn không bị mờ
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // CHỐT CỐ ĐỊNH TẠI ĐÂY:
      windowWidth: 794,  // Chiều rộng tương đương 210mm tại 96 DPI
      windowHeight: 1123 // Chiều cao tương đương 297mm tại 96 DPI
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 2. Khởi tạo PDF khổ A4 dọc (p = portrait, mm, a4)
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Kích thước chuẩn của 1 trang A4 tính bằng mm
    const pageWidth = 210;
    const pageHeight = 297;

    // 3. Chèn ảnh phủ kín hoàn toàn 1 trang A4
    // Sử dụng nén 'SLOW' hoặc để trống thay vì 'FAST' nếu muốn chất lượng ảnh watermark tốt nhất
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');

    // 4. Lưu file
    const today = new Date().toISOString().slice(0, 10);
    pdf.save(`UNC_BIDV_${today}.pdf`);

  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    alert("Lỗi hệ thống khi tạo PDF. Hãy kiểm tra lại kết nối mạng hoặc logo.");
  }
}
