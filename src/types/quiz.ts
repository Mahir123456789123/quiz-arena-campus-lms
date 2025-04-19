// If this file doesn't exist yet, we'll create it with the required types
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export type QuizRoomStatus = 'waiting' | 'active' | 'completed';
export type ParticipantStatus = 'active' | 'finished' | 'disconnected';

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  created_by: string;
  time_limit: number;
  question_count: number;
  is_published: boolean;
  difficulty: QuizDifficulty;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  order_position: number;
  explanation?: string;
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
  started_at?: string | null;
  ended_at?: string | null;
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
