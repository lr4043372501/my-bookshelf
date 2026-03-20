export interface Book {
  id: string;
  title: string;
  description: string;
  category: string;
  themes: string[];
  file_name: string;
  file_size: number;
  file_path: string;
  notebooklm_notebook_id?: string;
  audio_overview_url?: string;
  audio_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface BookUpload {
  file: File;
  title?: string;
}

export interface NotebookLMResponse {
  notebookId: string;
  audioUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export type BookCategory =
  | 'fiction'
  | 'non-fiction'
  | 'science'
  | 'technology'
  | 'history'
  | 'biography'
  | 'self-help'
  | 'business'
  | 'philosophy'
  | 'art'
  | 'other';

export const BOOK_CATEGORIES: { value: BookCategory; label: string }[] = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non-fiction', label: 'Non-Fiction' },
  { value: 'science', label: 'Science' },
  { value: 'technology', label: 'Technology' },
  { value: 'history', label: 'History' },
  { value: 'biography', label: 'Biography' },
  { value: 'self-help', label: 'Self-Help' },
  { value: 'business', label: 'Business' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'art', label: 'Art' },
  { value: 'other', label: 'Other' },
];