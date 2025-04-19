
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  course_id: string | null;
  created_by: string | null;
  question_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizRoom {
  id: string;
  room_code: string;
  quiz_id: string;
  host_id: string;
  status: 'waiting' | 'active' | 'completed';
  max_players: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}
