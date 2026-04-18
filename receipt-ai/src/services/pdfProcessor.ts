/**
 * PDF Processor
 *
 * Converts PDF pages → canvas images using pdfjs-dist (client-side, free).
 * The resulting image blobs are then passed directly into the Tesseract OCR pipeline.
 *
 * Install: npm install pdfjs-dist
 *
 * Usage:
 *   const pages = await extractPdfPages(file, { maxPages: 3 })
 *   for (const page of pages) {
 *     const data = await extractReceiptData(page.blob)
 *   }
 */

import * as pdfjsLib from 'pdfjs-dist';

// Point pdfjs to its worker bundle.
// With Vite you can also use: new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PdfPage {
  pageNumber: number;
  totalPages: number;
  blob: File;           // Ready to pass to extractReceiptData()
  dataUrl: string;      // For UI preview
  width: number;
  height: number;
}

export interface PdfProcessorOptions {
  /** Pages to extract (1-based). Defaults to all pages up to maxPages. */
  pages?: number[];
  /** Maximum pages to process. Default 5 (receipts are rarely multi-page). */
  maxPages?: number;
  /** Render scale — higher = sharper but slower. 2.0 gives ~150 DPI. Default 2.5. */
  scale?: number;
  /** JPEG quality 0–1. Default 0.92. */
  quality?: number;
  /** Progress callback: receives (currentPage, totalPages) */
  onProgress?: (current: number, total: number) => void;
}

/**
 * Load a PDF File and return metadata without rendering pages.
 */
export async function getPdfInfo(file: File): Promise<{ totalPages: number; title?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const meta = await pdf.getMetadata().catch(() => null);
  return {
    totalPages: pdf.numPages,
    title: (meta?.info as any)?.Title ?? undefined,
  };
}

/**
 * Render a single PDF page to a canvas and return a File blob.
 */
async function renderPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number,
  quality: number
): Promise<PdfPage> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  // White background (important — Tesseract struggles with transparent PNGs)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error(`Failed to render page ${pageNum}`));
        const file = new File([blob], `pdf_page_${pageNum}.jpg`, { type: 'image/jpeg' });
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          pageNumber: pageNum,
          totalPages: pdf.numPages,
          blob: file,
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Convert a PDF file into an array of page images ready for OCR.
 *
 * @example
 * const pages = await extractPdfPages(file, { maxPages: 1 })
 * const ocrResult = await extractReceiptData(pages[0].blob)
 */
export async function extractPdfPages(
  file: File,
  options: PdfProcessorOptions = {}
): Promise<PdfPage[]> {
  const {
    pages,
    maxPages = 5,
    scale = 2.5,
    quality = 0.92,
    onProgress,
  } = options;

  if (file.type !== 'application/pdf') {
    throw new Error('File is not a PDF');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const total = pdf.numPages;

  // Determine which pages to process
  let pageNums: number[];
  if (pages && pages.length > 0) {
    pageNums = pages.filter(p => p >= 1 && p <= total);
  } else {
    pageNums = Array.from({ length: Math.min(total, maxPages) }, (_, i) => i + 1);
  }

  const results: PdfPage[] = [];

  for (let i = 0; i < pageNums.length; i++) {
    const pageNum = pageNums[i];
    onProgress?.(i + 1, pageNums.length);
    const rendered = await renderPage(pdf, pageNum, scale, quality);
    results.push(rendered);
  }

  return results;
}

/**
 * Convenience: extract the first page only (most common for receipts).
 */
export async function extractFirstPdfPage(
  file: File,
  options?: Omit<PdfProcessorOptions, 'pages'>
): Promise<PdfPage> {
  const pages = await extractPdfPages(file, { ...options, pages: [1] });
  if (!pages[0]) throw new Error('Could not render PDF page');
  return pages[0];
}
