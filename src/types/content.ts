
export type ContentType = 'article' | 'video' | 'ppt';

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  article_snippet: string;
  author_id: string;
  author_name: string;
  created_at: string;
  date: string;
  file_path: string;
  is_published: boolean;
  rating: number;
  subject: string;
  updated_at: string;
  views: number;
  downloads?: number;
}
