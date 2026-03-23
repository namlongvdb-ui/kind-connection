import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper') as HTMLElement;
  if (!element) {
    alert("Không tìm thấy vùng dữ liệu 'unc-paper' để xuất PDF!");
    return;
  }

  // 1. LƯU LẠI TRẠNG THÁI GỐC
  const originalStyle = element.style.cssText;

  try {
    // 2. ÉP CỨNG KÍCH THƯỚC TRƯỚC KHI CHỤP (Fix lỗi bóp méo do màn hình nhỏ)
    // 210mm ~ 794px, 297mm ~ 1123px (tại 96 DPI)
    element.style.width = '210mm';
    element.style.height = '297mm';
    element.style.minWidth = '210mm';
    element.style.minHeight = '297mm';
    element.style.position = 'relative';
    element.style.left = '0';
    element.style.top = '0';
    element.style.transform = 'none'; // Loại bỏ các bộ lọc scale nếu có

    // 3. CHỤP ẢNH VỚI CẤU HÌNHwindowWidth CỐ ĐỊNH
    const canvas = await html2canvas(element, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Đảm bảo canvas render dựa trên kích thước thực của phần tử thay vì khung nhìn
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // 4. KHỞI TẠO PDF KHỔ A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    // 5. CHÈN ẢNH VỚI CHẾ ĐỘ NÉN NONE ĐỂ GIỮ ĐỘ NÉT TỐI ĐA
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');

    // 6. LƯU FILE
    const today = new Date().toISOString().slice(0, 10);
    pdf.save(`UNC_BIDV_${today}.pdf`);

  } catch (error) {
    console.error("Lỗi xuất PDF:", error);
    alert("Lỗi hệ thống khi tạo PDF.");
  } finally {
    // 7. KHÔI PHỤC LẠI STYLE GỐC ĐỂ GIAO DIỆN WEB KHÔNG BỊ LỖI
    element.style.cssText = originalStyle;
  }
}
