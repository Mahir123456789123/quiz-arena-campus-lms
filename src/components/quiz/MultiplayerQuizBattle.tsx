
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Quiz, QuizRoom } from '@/types/quiz';

const MultiplayerQuizBattle = () => {
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [activeRooms, setActiveRooms] = useState<QuizRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
    fetchActiveRooms();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

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

      const { data: existingParticipant } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', user?.id)
        .single();

      if (existingParticipant) {
        toast.info('You are already in this room');
        return;
      }

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
      setRoomCode('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
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
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Active Rooms</h2>
        {activeRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRooms.map(room => (
              <div key={room.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Room {room.room_code}</h3>
                    <p className="text-sm text-muted-foreground">Created {new Date(room.created_at).toLocaleTimeString()}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => joinRoom(room.room_code)}
                    disabled={isLoading || room.host_id === user?.id}
                  >
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No active rooms available</p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerQuizBattle;
