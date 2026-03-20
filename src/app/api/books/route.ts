import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createServerClient } from '@/lib/supabase';
import { processPDFWithNotebookLM, DEFAULT_AUDIO_CONFIG } from '@/lib/notebooklm';
import { BookCategory } from '@/types';

// This would be called from a server action since we can't handle file uploads
// in API routes with static export. For Cloudflare, we'd use a Worker.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category,
      themes,
      fileName,
      fileSize,
      filePath,
    } = body;

    // Validate required fields
    if (!title || !fileName || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerClient();

    // Insert book record
    const { data: book, error } = await supabase
      .from('books')
      .insert({
        id: uuidv4(),
        title,
        description: description || '',
        category: category as BookCategory,
        themes: themes || [],
        file_name: fileName,
        file_size: fileSize,
        file_path: filePath,
        audio_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save book' },
        { status: 500 }
      );
    }

    // Start NotebookLM processing (async)
    processPDFWithNotebookLM(filePath, title, DEFAULT_AUDIO_CONFIG)
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
      })
      .catch((err) => {
        console.error('NotebookLM processing error:', err);
      });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    let query = supabase.from('books').select('*');

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'title':
        query = query.order('title', { ascending: true });
        break;
      case 'size':
        query = query.order('file_size', { ascending: false });
        break;
      default: // newest
        query = query.order('created_at', { ascending: false });
    }

    const { data: books, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch books' },
        { status: 500 }
      );
    }

    return NextResponse.json({ books });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get book info first to delete file
    const { data: book } = await supabase
      .from('books')
      .select('file_path')
      .eq('id', id)
      .single();

    // Delete from storage if file exists
    if (book?.file_path) {
      await supabase.storage.from('books').remove([book.file_path]);
    }

    // Delete book record
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete book' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}