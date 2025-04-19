
export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type QuizRoomStatus = 'waiting' | 'active' | 'completed';
export type ParticipantStatus = 'active' | 'left' | 'kicked';

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  time_limit: number;
  question_count: number;
  is_published: boolean;
  difficulty: QuizDifficulty;
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
  quiz_id: string;
  host_id: string;
  room_code: string;
  status: QuizRoomStatus;
  max_players: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface QuizParticipant {
  id: string;
  room_id: string;
  user_id: string;
  score: number;
  status: ParticipantStatus;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
