
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

interface SocketMessage {
  type: 'answer' | 'score' | 'leaderboard';
  data: any;
}

export function useQuizSocket(roomId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, profile } = useAuth();

  const connect = useCallback(() => {
    // Only allow students to connect
    if (profile?.role === 'instructor') {
      console.log('Instructors cannot participate in quizzes');
      return;
    }

    const ws = new WebSocket('ws://127.0.0.1:12345');

    ws.onopen = () => {
      console.log('Connected to quiz server');
      setIsConnected(true);
      
      // Send join room message with user info
      if (user?.email) {
        ws.send(JSON.stringify({
          type: 'join',
          room: roomId,
          username: user.email,
          role: profile?.role
        }));
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from quiz server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user?.email, roomId, profile?.role]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);

  const sendAnswer = useCallback((answer: string) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'answer',
        room: roomId,
        answer
      }));
    }
  }, [socket, isConnected, roomId]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    sendAnswer,
    disconnect
  };
}
