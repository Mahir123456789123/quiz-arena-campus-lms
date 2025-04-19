import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  timeTaken: number;
}

const quizData: Record<string, Question[]> = {
  'operating-systems': [
    {
      question: "Which scheduling algorithm uses first-come-first-served?",
      options: ["FCFS", "Priority Scheduling", "Shortest Job First", "Round Robin"],
      answer: "1"
    },
    {
      question: "What is the main purpose of the file system?",
      options: ["Memory allocation", "Process management", "User interface", "I/O operations"],
      answer: "3"
    }
  ],
  'algorithms': [
    {
      question: "What is the time complexity of Quick Sort?",
      options: ["O(n log n)", "O(log n)", "O(n)", "O(1)"],
      answer: "3"
    },
    {
      question: "Which algorithm uses strict phases approach?",
      options: ["Dynamic Programming", "Greedy", "Backtracking", "Divide and Conquer"],
      answer: "1"
    }
  ],
  'computer-networks': [
    {
      question: "Which layer handles routing in the OSI model?",
      options: ["Transport", "Physical", "Data Link", "Network"],
      answer: "4"
    },
    {
      question: "What does UDP stand for?",
      options: ["File Transfer Protocol", "Transmission Control Protocol", "Internet Protocol", "User Datagram Protocol"],
      answer: "4"
    }
  ],
  // ... More categories with their questions follow the same pattern
};

const QuizTaking: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const questions = quizData[roomId] || [];

  useEffect(() => {
    if (profile?.role === 'instructor') {
      toast.error('Instructors cannot take quizzes');
      navigate('/quiz-battles');
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (isFinished) {
      fetchLeaderboard();
      
      // Subscribe to changes in quiz_results
      const channel = supabase
        .channel('quiz_results_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'quiz_results',
            filter: `quiz_category=eq.${roomId}`
          },
          () => {
            // Fetch updated leaderboard when new results are inserted
            fetchLeaderboard();
          }
        )
        .subscribe();

      // Cleanup subscription
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isFinished, roomId]);

  const fetchLeaderboard = async () => {
    try {
      // First, fetch quiz results
      const { data: resultsData, error: resultsError } = await supabase
        .from('quiz_results')
        .select('id, user_id, score, time_taken')
        .eq('quiz_category', roomId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });
      
      if (resultsError) throw resultsError;
      
      // Then for each result, get the profile information
      const formattedLeaderboard = await Promise.all(
        resultsData.map(async (result) => {
          // Get profile information for each user
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', result.user_id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
            return {
              username: 'Anonymous Student',
              score: result.score,
              timeTaken: result.time_taken
            };
          }
          
          return {
            username: profileData?.full_name || 'Anonymous Student',
            score: result.score,
            timeTaken: result.time_taken
          };
        })
      );
      
      setLeaderboard(formattedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    }
  };

  const saveQuizResult = async (score: number, timeTaken: number) => {
    try {
      const { error } = await supabase
        .from('quiz_results')
        .insert({
          quiz_category: roomId,
          score: score,
          time_taken: timeTaken,
          user_id: profile?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast.error('Failed to save quiz result');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const goToNextQuestion = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    if (selectedAnswer + 1 === parseInt(questions[currentQuestionIndex].answer)) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      const timeTaken = (Date.now() - startTime) / 1000;
      const finalScore = score + (selectedAnswer + 1 === parseInt(questions[currentQuestionIndex].answer) ? 1 : 0);
      
      setIsFinished(true);
      await saveQuizResult(finalScore, timeTaken);
      await fetchLeaderboard();
    }
  };

  if (profile?.role === 'instructor') {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {isFinished ? (
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold mb-6">Quiz Complete!</h2>
              <p className="text-lg mb-8">Your Score: {score} / {questions.length}</p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Results
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Time (s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{entry.username}</TableCell>
                        <TableCell className="text-right">{entry.score}/{questions.length}</TableCell>
                        <TableCell className="text-right">{entry.timeTaken.toFixed(1)}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <Button 
                onClick={() => navigate('/quiz-battles')} 
                variant="outline" 
                className="mt-6"
              >
                Back to Quiz Battles
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>Score: {score}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {questions[currentQuestionIndex].question}
                </h3>
                <ul className="space-y-2">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <li key={index}>
                      <Button
                        variant={selectedAnswer === index ? 'secondary' : 'outline'}
                        className="w-full text-left justify-start"
                        onClick={() => handleAnswerSelect(index)}
                      >
                        {option}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={goToNextQuestion} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaking;
