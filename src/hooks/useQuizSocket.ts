
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

interface SocketMessage {
  type: 'answer' | 'score' | 'leaderboard';
  data: any;
}

export function useQuizSocket(roomId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const connect = useCallback(() => {
    const ws = new WebSocket('ws://127.0.0.1:12345');

    ws.onopen = () => {
      console.log('Connected to quiz server');
      setIsConnected(true);
      
      // Send join room message
      if (user?.email) {
        ws.send(user.email);
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
  }, [user?.email]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup();
  }, [connect]);

  const sendAnswer = useCallback((answer: string) => {
    if (socket && isConnected) {
      socket.send(answer);
    }
  }, [socket, isConnected]);

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
