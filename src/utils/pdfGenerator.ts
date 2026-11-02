/**
 * Professional Precision A4 PDF Generator for Crater Enterprise Invoicing
 * - Generates exact ISO A4 Portrait documents (210mm x 297mm).
 * - Accurately replicates the exact invoice preview styling: fonts, colors, badges, borders, alignments.
 * - Intelligently renders direct source element with desktop A4 width preservation.
 * - Fits A4 page proportionally with crisp 2x pixel ratio.
 */
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export interface GeneratedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
}

/**
 * Capture an HTML element and convert it into a precision-crafted A4 PDF Blob
 * matching the visual preview 1:1.
 */
export async function generatePdfFromElement(
  elementId: string,
  filename = 'dokumen.pdf'
): Promise<GeneratedPdfResult | null> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error(`Element with id "${elementId}" not found for PDF generation.`);
    return null;
  }

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Create an off-screen clone with exact dimensions matching the preview desktop layout
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-print-clone`;
  
  // Set width to 896px (which matches max-w-4xl = 56rem = 896px of the preview card)
  clone.style.width = '896px';
  clone.style.maxWidth = '896px';
  clone.style.minWidth = '896px';
  clone.style.margin = '0';
  clone.style.padding = '36px 40px';
  clone.style.borderRadius = '0px';
  clone.style.border = 'none';
  clone.style.boxShadow = 'none';
  clone.style.background = '#ffffff';
  clone.style.color = '#1e293b';
  clone.style.position = 'fixed';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.zIndex = '-9999';
  clone.style.boxSizing = 'border-box';
  clone.style.overflow = 'visible';

  // Ensure no-print elements inside the clone are hidden
  clone.querySelectorAll('.no-print').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  document.body.appendChild(clone);

  try {
    // Rasterize with html-to-image at high quality (pixelRatio 2)
    const dataUrl = await toPng(clone, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true, // Prevents cross-origin SecurityError
    });

    // Load image into memory to get actual dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
    });

    const imgWidth = img.width;
    const imgHeight = img.height;
    const aspectRatio = imgHeight / imgWidth;

    // Initialize jsPDF in A4 Portrait format (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8; // 8mm margin for generous, clean print area
    const printWidth = pageWidth - margin * 2; // 194 mm
    const printHeight = pageHeight - margin * 2; // 281 mm

    const renderedHeight = printWidth * aspectRatio;

    // Intelligent Page Fitting:
    // If the invoice comfortably fits on 1 page (up to ~310mm), scale slightly to keep it on 1 clean A4 page
    if (renderedHeight <= 315) {
      if (renderedHeight > printHeight) {
        // Gently scale down so it fits perfectly on 1 page
        const scale = printHeight / renderedHeight;
        const fittedWidth = printWidth * scale;
        const fittedHeight = printHeight;
        const posX = (pageWidth - fittedWidth) / 2;
        pdf.addImage(dataUrl, 'PNG', posX, margin, fittedWidth, fittedHeight, undefined, 'FAST');
      } else {
        // Fits within 1 page without scaling
        const posX = (pageWidth - printWidth) / 2;
        pdf.addImage(dataUrl, 'PNG', posX, margin, printWidth, renderedHeight, undefined, 'FAST');
      }
    } else {
      // Multi-Page Slicing using canvas chunks
      const totalPages = Math.ceil(renderedHeight / printHeight);
      const chunkPixelHeight = (imgWidth * printHeight) / printWidth;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = chunkPixelHeight;
        const ctx = pageCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          const sourceY = page * chunkPixelHeight;
          const availableSourceHeight = Math.min(chunkPixelHeight, imgHeight - sourceY);

          ctx.drawImage(
            img,
            0,
            sourceY,
            imgWidth,
            availableSourceHeight,
            0,
            0,
            imgWidth,
            availableSourceHeight
          );

          const chunkDataUrl = pageCanvas.toDataURL('image/png');
          pdf.addImage(chunkDataUrl, 'PNG', margin, margin, printWidth, printHeight, undefined, 'FAST');

          // Clean footer page indicator
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(
            `Halaman ${page + 1} dari ${totalPages}`,
            pageWidth - margin,
            pageHeight - 4,
            { align: 'right' }
          );
        }
      }
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: safeFilename,
    };
  } catch (error) {
    console.error('Failed to generate precision A4 PDF:', error);
    return null;
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
}

/**
 * Triggers direct browser download of a generated PDF
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
