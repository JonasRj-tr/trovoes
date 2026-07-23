import { Category } from '../types';

/**
 * Calculates age based on birth date (YYYY-MM-DD).
 */
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Determines football age category automatically based on birth date.
 * - Under 14 (<= 14): Sub 14
 * - 15: Sub 15
 * - 16 - 17: Sub 17
 * - 18 - 20+: Sub 20
 */
export function calculateCategory(birthDateString: string): Category {
  const age = calculateAge(birthDateString);
  if (age <= 14) return 'Sub 14';
  if (age === 15) return 'Sub 15';
  if (age <= 17) return 'Sub 17';
  return 'Sub 20';
}

/**
 * Formats YYYY-MM-DD string to Brazilian format DD/MM/YYYY.
 */
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Exports JSON array data to a downloadable CSV file.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prints or generates printable window layout for PDF exports.
 */
export function printReport(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para gerar o relatório em PDF.');
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #111; }
          h1 { color: #0A111E; border-bottom: 2px solid #FFCC00; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #0A111E; color: #fff; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header-badge { font-weight: bold; color: #FF6B00; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h1>⚡ TROVOES - ${title}</h1>
          <span>Data: ${new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        ${htmlContent}
        <br/>
        <button onclick="window.print()" style="padding:10px 20px; background:#0A111E; color:#FFCC00; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Imprimir / Salvar PDF</button>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Compresses and resizes image file to lightweight Base64 string
 * to prevent Firestore document size limit errors (1MB max per doc).
 */
export function compressImage(file: File, maxWidth = 750, quality = 0.55): Promise<string> {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } else {
          resolve(event.target?.result as string || '');
        }
      };
      img.onerror = () => resolve(event.target?.result as string || '');
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

