
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

export interface CourseDiscussion {
  id: string;
  content: string;
  course_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes: string[];
  dislikes: string[];
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}
