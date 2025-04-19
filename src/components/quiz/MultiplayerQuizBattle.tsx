
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, LogIn, Users } from 'lucide-react';
import type { Quiz, QuizRoom, QuizParticipant } from '@/types/quiz';

const MultiplayerQuizBattle = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [activeRooms, setActiveRooms] = useState<QuizRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';
  const isStudent = profile?.role === 'student';

  useEffect(() => {
    fetchQuizzes();
    fetchActiveRooms();
    // Set up a realtime subscription for active rooms
    const roomsChannel = supabase
      .channel('quiz_rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'quiz_rooms' }, 
        () => {
          fetchActiveRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [profile?.role]);

  const fetchQuizzes = async () => {
    try {
      let query = supabase
        .from('quizzes')
        .select('*');
      
      // If instructor, only show their own quizzes
      if (isInstructor) {
        query = query.eq('created_by', user?.id);
      } else {
        // For students, only show published quizzes
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      const typeSafeQuizzes = data.map(quiz => ({
        ...quiz,
        difficulty: quiz.difficulty as Quiz['difficulty']
      }));
      
      setAvailableQuizzes(typeSafeQuizzes);
    } catch (error: any) {
      toast.error('Failed to load quizzes');
      console.error(error);
    }
  };

  const fetchActiveRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const typeSafeRooms = data.map(room => ({
        ...room,
        status: room.status as QuizRoom['status']
      }));
      
      setActiveRooms(typeSafeRooms);
    } catch (error: any) {
      toast.error('Failed to load active rooms');
      console.error(error);
    }
  };

  const joinRoom = async (code: string) => {
    if (!code) {
      toast.error('Please enter a room code');
      return;
    }

    setIsLoading(true);
    try {
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', code.toUpperCase())
        .single();

      if (roomError) throw new Error('Room not found or no longer active');

      if (room.status !== 'waiting') {
        throw new Error('This room is no longer accepting participants');
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user?.id)
        .single();

      if (existingParticipant) {
        // Navigate to the quiz taking interface with the room ID
        navigate(`/quiz-battle/${room.id}`);
        return;
      }

      // Add the user as a participant
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .insert({
          room_id: room.id,
          user_id: user?.id,
          score: 0,
          status: 'active'
        });

      if (participantError) throw participantError;

      toast.success('Joined room successfully!');
      
      // Navigate to the quiz taking interface
      navigate(`/quiz-battle/${room.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      // Generate a random 3-digit room code
      const roomCode = Math.floor(100 + Math.random() * 900).toString();

      // Create a quiz room
      const { data: room, error: roomError } = await supabase
        .from('quiz_rooms')
        .insert({
          quiz_id: quizId,
          room_code: roomCode,
          host_id: user?.id,
          status: 'waiting',
          max_players: 50
        })
        .select()
        .single();

      if (roomError) throw roomError;

      toast.success(`Quiz room created! Room code: ${roomCode}`);
      navigate(`/quiz-battle/${room.id}`);
    } catch (error: any) {
      toast.error('Failed to create quiz room');
      console.error(error);
    }
  };

  const startExistingRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString() 
        })
        .eq('id', roomId)
        .eq('host_id', user?.id); // Make sure only the host can start the quiz

      if (error) throw error;

      toast.success('Quiz started!');
      navigate(`/quiz-battle/${roomId}`);
    } catch (error: any) {
      toast.error('Failed to start quiz');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {isStudent && (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Join a Quiz</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Enter room code"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value)}
              className="md:w-64"
            />
            <Button 
              onClick={() => joinRoom(roomCode)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </div>
      )}

      {isInstructor && (
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Quizzes</h2>
          {availableQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableQuizzes.map((quiz) => (
                <div key={quiz.id} className="border p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-4 w-4 mr-2 text-primary" />
                    <h3 className="font-semibold">{quiz.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {quiz.question_count} questions · {quiz.difficulty}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => startQuiz(quiz.id)}
                    className="w-full"
                  >
                    Start New Quiz Room
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't created any quizzes yet.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/instructor/course-quizzes')}
              >
                Create Quiz
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Active Rooms</h2>
        {activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map(room => (
              <div key={room.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      <h3 className="font-semibold">Room {room.room_code}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Created {new Date(room.created_at).toLocaleTimeString()}</p>
                  </div>
                  {isStudent && room.host_id !== user?.id && (
                    <Button 
                      size="sm" 
                      onClick={() => joinRoom(room.room_code)}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      <LogIn className="h-3 w-3" />
                      Join
                    </Button>
                  )}
                  {isInstructor && room.host_id === user?.id && (
                    <Button 
                      size="sm"
                      onClick={() => startExistingRoom(room.id)}
                      className="flex items-center gap-1"
                    >
                      Start Quiz
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active rooms available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerQuizBattle;
