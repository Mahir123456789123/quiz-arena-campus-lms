
import React, { useEffect, useState } from 'react';
import { useQuizSocket } from '@/hooks/useQuizSocket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface QuizSocketProps {
  roomId: string;
  onScoreUpdate?: (score: number) => void;
}

interface LeaderboardEntry {
  username: string;
  score: number;
}

const QuizSocket: React.FC<QuizSocketProps> = ({ roomId, onScoreUpdate }) => {
  const { socket, isConnected } = useQuizSocket(roomId);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'leaderboard') {
          setLeaderboard(message.data);
        }
      } catch (error) {
        console.error('Error parsing socket message:', error);
      }
    };
  }, [socket, onScoreUpdate, toast]);

  if (!isConnected || profile?.role === 'instructor') return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Quiz Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`flex items-center justify-between p-3 rounded-md ${
                index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                index === 1 ? 'bg-gray-100 dark:bg-gray-800' :
                index === 2 ? 'bg-amber-100 dark:bg-amber-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{index + 1}.</span>
                <span>{entry.username}</span>
              </div>
              <span className="font-bold">{entry.score} pts</span>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-center text-muted-foreground">
              No scores yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSocket;
