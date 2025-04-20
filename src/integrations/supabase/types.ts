export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string | null
          deadline: string
          description: string | null
          id: string
          material_id: string
          title: string
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deadline: string
          description?: string | null
          id?: string
          material_id: string
          title: string
          total_marks?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string
          description?: string | null
          id?: string
          material_id?: string
          title?: string
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "chapter_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_materials: {
        Row: {
          chapter_id: string
          content: string | null
          created_at: string | null
          id: string
          is_assignment: boolean | null
          title: string
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          chapter_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_assignment?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          chapter_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_assignment?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapter_materials_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          order_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_number?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_bot: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_bot?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_materials: {
        Row: {
          completed_at: string | null
          id: string
          material_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          material_id: string
          student_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          material_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "chapter_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          article_snippet: string | null
          author_id: string
          author_name: string
          created_at: string | null
          date: string | null
          downloads: number
          file_path: string | null
          id: string
          is_published: boolean
          rating: number
          subject: string
          title: string
          type: string
          updated_at: string | null
          views: number
        }
        Insert: {
          article_snippet?: string | null
          author_id: string
          author_name: string
          created_at?: string | null
          date?: string | null
          downloads?: number
          file_path?: string | null
          id?: string
          is_published?: boolean
          rating?: number
          subject: string
          title: string
          type: string
          updated_at?: string | null
          views?: number
        }
        Update: {
          article_snippet?: string | null
          author_id?: string
          author_name?: string
          created_at?: string | null
          date?: string | null
          downloads?: number
          file_path?: string | null
          id?: string
          is_published?: boolean
          rating?: number
          subject?: string
          title?: string
          type?: string
          updated_at?: string | null
          views?: number
        }
        Relationships: []
      }
      course_discussions: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          dislikes: string[] | null
          id: string
          likes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          dislikes?: string[] | null
          id?: string
          likes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          dislikes?: string[] | null
          id?: string
          likes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          instructor_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          instructor_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_profiles_fk"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dcourses: {
        Row: {
          course_id: string
          course_name: string
          department: string
          difficulty: string | null
          duration_hrs: number | null
          prerequisites: string | null
          semester: number
          tags: string | null
          type: string | null
        }
        Insert: {
          course_id: string
          course_name: string
          department: string
          difficulty?: string | null
          duration_hrs?: number | null
          prerequisites?: string | null
          semester: number
          tags?: string | null
          type?: string | null
        }
        Update: {
          course_id?: string
          course_name?: string
          department?: string
          difficulty?: string | null
          duration_hrs?: number | null
          prerequisites?: string | null
          semester?: number
          tags?: string | null
          type?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          course_name: string
          created_at: string | null
          due_date: string
          id: string
          student_id: string
          task: string
          updated_at: string | null
        }
        Insert: {
          course_name: string
          created_at?: string | null
          due_date: string
          id?: string
          student_id: string
          task: string
          updated_at?: string | null
        }
        Update: {
          course_name?: string
          created_at?: string | null
          due_date?: string
          id?: string
          student_id?: string
          task?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_profiles_fk"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal: {
        Row: {
          completed: boolean
          created_at: string | null
          id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          id?: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          completed_at: string | null
          id: string
          quiz_category: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quiz_category: string
          score: number
          time_taken: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          quiz_category?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed_modules: number
          course_name: string
          created_at: string | null
          id: string
          student_id: string
          total_modules: number
          updated_at: string | null
        }
        Insert: {
          completed_modules?: number
          course_name: string
          created_at?: string | null
          id?: string
          student_id: string
          total_modules?: number
          updated_at?: string | null
        }
        Update: {
          completed_modules?: number
          course_name?: string
          created_at?: string | null
          id?: string
          student_id?: string
          total_modules?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_participants: {
        Row: {
          id: string
          joined_at: string | null
          room_id: string
          score: number
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          room_id: string
          score?: number
          status: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          room_id?: string
          score?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "quiz_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string | null
          explanation: string | null
          id: string
          options: string[]
          order_position: number
          question_text: string
          quiz_id: string
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          options: string[]
          order_position: number
          question_text: string
          quiz_id: string
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: string[]
          order_position?: number
          question_text?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          completed_at: string | null
          id: string
          quiz_category: string
          score: number
          time_taken: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          quiz_category: string
          score: number
          time_taken: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          quiz_category?: string
          score?: number
          time_taken?: number
          user_id?: string
        }
        Relationships: []
      }
      quiz_rooms: {
        Row: {
          created_at: string | null
          ended_at: string | null
          host_id: string
          id: string
          max_players: number
          quiz_id: string
          room_code: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          host_id: string
          id?: string
          max_players?: number
          quiz_id: string
          room_code: string
          started_at?: string | null
          status: string
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          host_id?: string
          id?: string
          max_players?: number
          quiz_id?: string
          room_code?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_rooms_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          is_published: boolean
          question_count: number
          time_limit: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          question_count?: number
          time_limit?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_published?: boolean
          question_count?: number
          time_limit?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_meetings: {
        Row: {
          created_at: string
          created_by: string
          id: string
          room_id: string
          scheduled_date: string
          scheduled_time: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          room_id: string
          scheduled_date: string
          scheduled_time: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          room_id?: string
          scheduled_date?: string
          scheduled_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          completed: boolean
          created_at: string | null
          id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          id?: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          completedmodules: number
          course_id: string
          created_at: string | null
          date: string
          id: string
          minutes: number
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completedmodules?: number
          course_id: string
          created_at?: string | null
          date?: string
          id?: string
          minutes: number
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completedmodules?: number
          course_id?: string
          created_at?: string | null
          date?: string
          id?: string
          minutes?: number
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          graded_at: string | null
          id: string
          marks_obtained: number | null
          student_id: string
          submission_content: string | null
          submission_url: string | null
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          marks_obtained?: number | null
          student_id: string
          submission_content?: string | null
          submission_url?: string | null
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          graded_at?: string | null
          id?: string
          marks_obtained?: number | null
          student_id?: string
          submission_content?: string | null
          submission_url?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_course_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
