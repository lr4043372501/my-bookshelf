'use client';

import { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
  onPlayAudio: (book: Book) => void;
}

export function BookCard({ book, onDelete, onPlayAudio }: BookCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (book.audio_status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Ready
          </span>
        );
      case 'processing':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400 rounded-full">
            Pending
          </span>
        );
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      fiction: 'Fiction',
      'non-fiction': 'Non-Fiction',
      science: 'Science',
      technology: 'Technology',
      history: 'History',
      biography: 'Biography',
      'self-help': 'Self-Help',
      business: 'Business',
      philosophy: 'Philosophy',
      art: 'Art',
      other: 'Other',
    };
    return labels[category] || category;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate" title={book.title}>
              {book.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getCategoryLabel(book.category)}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(book.file_size)}
              </span>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {book.description}
        </p>

        {book.themes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {book.themes.slice(0, 5).map((theme, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded"
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Added {formatDate(book.created_at)}
          </span>

          <div className="flex items-center gap-2">
            {book.audio_status === 'completed' && book.audio_overview_url && (
              <button
                onClick={() => onPlayAudio(book)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Play Audio
              </button>
            )}
            <button
              onClick={() => onDelete(book.id)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}