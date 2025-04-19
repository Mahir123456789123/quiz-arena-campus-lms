
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  course_id: string | null;
  created_by: string;
  question_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_position: number;
  created_at: string;
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

export interface QuizParticipant {
  id: string;
  room_id: string;
  user_id: string;
  score: number;
  status: 'active' | 'left' | 'completed';
  joined_at: string;
}
