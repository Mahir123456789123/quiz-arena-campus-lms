
export interface CourseDiscussion {
  id: string;
  content: string;
  course_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes?: string[];
  dislikes?: string[];
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}
