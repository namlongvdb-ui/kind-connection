import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportUNCToPDF() {
  const element = document.getElementById('unc-paper');
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const w = imgWidth * ratio;
  const h = imgHeight * ratio;

  pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
  pdf.save(`UNC_${new Date().toISOString().slice(0, 10)}.pdf`);
}
