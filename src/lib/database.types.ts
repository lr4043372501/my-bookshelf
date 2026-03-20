export interface Json {
  [key: string]: Json | undefined;
}

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          themes: string[];
          file_name: string;
          file_size: number;
          file_path: string;
          notebooklm_notebook_id: string | null;
          audio_overview_url: string | null;
          audio_status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category?: string;
          themes?: string[];
          file_name: string;
          file_size: number;
          file_path: string;
          notebooklm_notebook_id?: string | null;
          audio_overview_url?: string | null;
          audio_status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          themes?: string[];
          file_name?: string;
          file_size?: number;
          file_path?: string;
          notebooklm_notebook_id?: string | null;
          audio_overview_url?: string | null;
          audio_status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}