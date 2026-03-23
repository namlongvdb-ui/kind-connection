import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper');
  if (!element) return;

  // Clone element off-screen at fixed A4 pixel dimensions to avoid viewport influence
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '794px';    // 210mm at 96dpi
  clone.style.minHeight = '1123px'; // 297mm at 96dpi
  clone.style.height = '1123px';
  clone.style.overflow = 'hidden';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 794,
    height: 1123,
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  pdf.save(`UNC_${new Date().toISOString().slice(0, 10)}.pdf`);
}
