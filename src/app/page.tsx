'use client';

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { processPDF } from '@/lib/pdf-processor';
import { processPDFWithNotebookLM, DEFAULT_AUDIO_CONFIG } from '@/lib/notebooklm';
import { Book, BookCategory } from '@/types';
import { PDFUploader } from '@/components/PDFUploader';
import { BookCard } from '@/components/BookCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SearchFilters } from '@/components/SearchFilters';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'size'>('newest');

  // Fetch books on mount
  useState(() => {
    fetchBooks();
  });

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('books').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'size':
          query = query.order('file_size', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  const handleUpload = useCallback(async (file: File, category: BookCategory) => {
    setIsUploading(true);
    try {
      // Process PDF to extract text and metadata
      const processedPDF = await processPDF(file);

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `books/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert book record
      const { data: book, error: insertError } = await supabase
        .from('books')
        .insert({
          title: processedPDF.title,
          description: processedPDF.description,
          category: category,
          themes: processedPDF.themes,
          file_name: file.name,
          file_size: file.size,
          file_path: filePath,
          audio_status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Start NotebookLM processing (async)
      processPDFWithNotebookLM(file, processedPDF.title, DEFAULT_AUDIO_CONFIG)
        .then(async (result) => {
          // Update book with notebook info
          await supabase
            .from('books')
            .update({
              notebooklm_notebook_id: result.notebookId,
              audio_status: result.status as 'pending' | 'processing' | 'completed' | 'failed',
              audio_overview_url: result.audioUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', book.id);

          // Refresh books list
          fetchBooks();
        })
        .catch((err) => {
          console.error('NotebookLM processing error:', err);
        });

      // Add to local state immediately
      setBooks((prev) => [book as Book, ...prev]);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [fetchBooks]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      // Get book info first
      const book = books.find((b) => b.id === id);

      // Delete from storage
      if (book?.file_path) {
        await supabase.storage.from('books').remove([book.file_path]);
      }

      // Delete from database
      const { error } = await supabase.from('books').delete().eq('id', id);

      if (error) throw error;

      // Update local state
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete book');
    }
  }, [books]);

  const handlePlayAudio = useCallback((book: Book) => {
    setSelectedBook(book);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookshelf
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload PDF books and generate Spanish audio overviews with NotebookLM
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Upload a Book
          </h2>
          <PDFUploader onUpload={handleUpload} isUploading={isUploading} />
        </section>

        {/* Search and Filters */}
        <section className="mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </section>

        {/* Book List */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Your Books ({books.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg
                className="animate-spin w-8 h-8 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p>No books yet. Upload your first book to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={handleDelete}
                  onPlayAudio={handlePlayAudio}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Audio Player Modal */}
      {selectedBook && (
        <AudioPlayer book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </main>
  );
}