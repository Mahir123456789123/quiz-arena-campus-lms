
export interface Content {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  type: 'video' | 'article' | 'ppt';
  subject: string;
  article_snippet?: string;
  file_path?: string | null;
  is_published: boolean;
  views: number;
  rating: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}
