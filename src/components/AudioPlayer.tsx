'use client';

import { Book } from '@/types';

interface AudioPlayerProps {
  book: Book;
  onClose: () => void;
}

export function AudioPlayer({ book, onClose }: AudioPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{book.title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-medium">Audio Style:</span> Deep Dive (Spanish)
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Length:</span> Default
            </p>
          </div>

          {book.audio_overview_url ? (
            <audio
              controls
              className="w-full"
              src={book.audio_overview_url}
            >
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <p>Audio not available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}