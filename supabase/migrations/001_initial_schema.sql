-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'other',
  themes TEXT[] DEFAULT '{}',
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  notebooklm_notebook_id TEXT,
  audio_overview_url TEXT,
  audio_status TEXT DEFAULT 'pending' CHECK (audio_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_audio_status ON books(audio_status);

-- Create full-text search index for title and description
CREATE INDEX IF NOT EXISTS idx_books_title_search ON books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_description_search ON books USING gin(to_tsvector('english', description));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for PDF files
-- Note: Run this in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', false);

-- Storage policies
-- CREATE POLICY "Users can upload books"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'books');

-- CREATE POLICY "Users can read their own books"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'books');

-- CREATE POLICY "Users can delete their own books"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'books');

-- RLS policies for books table
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Allow public read (adjust based on your auth requirements)
CREATE POLICY "Public read access" ON books FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert" ON books FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update" ON books FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete" ON books FOR DELETE
  USING (auth.role() = 'authenticated');