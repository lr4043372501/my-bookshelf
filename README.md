# My Bookshelf

A web application for uploading PDF books and generating Spanish audio overviews using NotebookLM.

## Features

- **PDF Upload**: Upload PDF books with drag-and-drop support
- **Auto-Categorization**: Automatic book categorization based on content analysis
- **Audio Overview Generation**: Create Spanish "Deep Dive" audio overviews via NotebookLM
- **Search & Filter**: Search books by title, description, or themes; filter by category
- **Supabase Integration**: Store books and files in Supabase database/storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for PDF files
- **Audio Generation**: NotebookLM API (Deep Dive, Spanish)
- **Deployment**: Cloudflare Pages/Workers

## Prerequisites

1. Node.js 18+
2. A Supabase account and project
3. Cloudflare account (for deployment)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/my-bookshelf.git
cd my-bookshelf
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_URL` - Same as NEXT_PUBLIC_SUPABASE_URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 4. Set up Supabase

Create the following tables in your Supabase project:

```sql
-- Books table
CREATE TABLE books (
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
  audio_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_created_at ON books(created_at DESC);

-- Storage bucket for PDF files
-- Create a bucket named 'books' in Supabase Storage
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Cloudflare

### 1. Install Cloudflare CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Build and deploy

```bash
npm run pages:build
npm run deploy
```

## Usage

1. **Upload a Book**: Drag and drop a PDF file or click to select
2. **Select Category**: Choose a category for the book (auto-detected)
3. **Generate Audio**: The app automatically creates a Spanish "Deep Dive" audio overview
4. **Listen**: Play the audio overview directly from the app
5. **Search**: Find books by title, description, or themes
6. **Filter**: Browse by category

## NotebookLM Integration

The app uses NotebookLM to generate audio overviews with these settings:
- **Style**: Deep Dive (comprehensive exploration)
- **Language**: Spanish
- **Length**: Default

## License

MIT