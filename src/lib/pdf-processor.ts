/**
 * PDF Processing utilities
 */

import { categorizeBook, generateDescription } from './categorizer';
import { BookCategory } from '@/types';

export interface ProcessedPDF {
  title: string;
  description: string;
  category: BookCategory;
  themes: string[];
  textContent: string;
}

/**
 * Extract text from PDF file
 * Note: In browser environment, we'll use a simple approach
 * For server-side processing, we'd use pdf-parse
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // For client-side, we'll read the file as ArrayBuffer
  // and use pdf.js library for text extraction
  try {
    // Dynamic import for pdf.js (browser-compatible)
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: unknown) => (item as { str: string }).str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    // Fallback: return file name as text
    return file.name.replace('.pdf', '').replace(/[-_]/g, ' ');
  }
}

/**
 * Get PDF metadata
 */
export function getPDFMetadata(file: File): { name: string; size: number } {
  return {
    name: file.name,
    size: file.size,
  };
}

/**
 * Extract title from PDF filename
 */
export function extractTitle(filename: string): string {
  // Remove .pdf extension and clean up the filename
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Process a PDF file and extract metadata
 */
export async function processPDF(file: File): Promise<ProcessedPDF> {
  const metadata = getPDFMetadata(file);
  const title = extractTitle(metadata.name);

  // Extract text content
  const textContent = await extractTextFromPDF(file);

  // Categorize and get description
  const categorization = categorizeBook(textContent, title);
  const description = generateDescription(textContent, title, categorization.category);

  return {
    title,
    description,
    category: categorization.category,
    themes: categorization.themes,
    textContent,
  };
}