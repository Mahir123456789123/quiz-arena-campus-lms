
export interface ContentItem {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  type: "video" | "ppt" | "article";
  views: number;
  rating: number;
  subject: string;
  date: string;
  preview_url?: string;
  article_snippet?: string;
  file_path?: string;
  is_published: boolean;
}
