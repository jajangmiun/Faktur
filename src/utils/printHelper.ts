/**
 * Print & Export Helper for Invoices and Estimates
 * crater-style PDF & Print generation
 * Direct system print (Save as PDF) with complete A4 styling and offline HTML fallback.
 */

export function downloadA4Document(elementId: string, documentTitle = 'Dokumen'): void {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) return;

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle}</title>
  <style>
    @page { 
      size: A4 portrait; 
      margin: 10mm 12mm; 
    }
    * { 
      box-sizing: border-box; 
      -webkit-print-color-adjust: exact !important; 
      print-color-adjust: exact !important; 
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.4;
    }
    .printable-document {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; }
    .border-b { border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .no-print { display: none !important; }
    @media print {
      body { padding: 0; }
      .printable-document { max-width: 100% !important; margin: 0 !important; }
    }
  </style>
</head>
<body>
  ${sourceElement.outerHTML}
  <script>
    // Automatically prompt print dialog when opened in browser
    window.onload = function() {
      try {
        window.print();
      } catch (e) {
        console.warn('Auto print error:', e);
      }
    };
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${documentTitle}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printDocument(elementId: string, documentTitle = 'Dokumen'): boolean {
  const previousTitle = document.title;
  try {
    document.title = documentTitle;
    window.print();
    return true;
  } catch (err) {
    console.warn('Direct print blocked or failed, falling back to download:', err);
    downloadA4Document(elementId, documentTitle);
    return false;
  } finally {
    setTimeout(() => {
      document.title = previousTitle;
    }, 1500);
  }
}
