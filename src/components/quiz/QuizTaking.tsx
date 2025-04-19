
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QuizQuestion, QuizRoom } from '@/types/quiz';

const QuizTaking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;
    
    fetchQuizRoom();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [roomId, user]);

  const fetchQuizRoom = async () => {
    try {
      setLoading(true);
      
      // Get room details
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
        
      if (roomError) throw roomError;
      
      // Ensure the room data is properly typed
      const typedRoomData: QuizRoom = {
        ...roomData,
        status: roomData.status as QuizRoom['status']
      };
      
      setRoom(typedRoomData);
      
      // Get quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', roomData.quiz_id)
        .single();
        
      if (quizError) throw quizError;
      setQuiz(quizData);
      
      // Get quiz questions
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', roomData.quiz_id)
        .order('order_position', { ascending: true });
        
      if (questionError) throw questionError;
      setQuestions(questionData);
      
      // Initialize timer
      setTimeLeft(quizData.time_limit * 60);
      
      // Start the timer
      startTimer();
      
      // Check if user is authorized
      const { data: participant, error: participantError } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user?.id)
        .single();
      
      if (participantError) {
        toast.error('You are not authorized to take this quiz');
        navigate('/quiz-battles');
        return;
      }
      
      // Update room status to active if host
      if (roomData.host_id === user?.id && roomData.status === 'waiting') {
        await supabase
          .from('quiz_rooms')
          .update({ status: 'active', started_at: new Date().toISOString() })
          .eq('id', roomId);
          
        // Notify participants the quiz has started
        toast.info('Quiz has started!');
      }
      
    } catch (error: any) {
      toast.error(error.message);
      navigate('/quiz-battles');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          completeQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    // Check if answer is correct and update score
    if (selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    // Check if the last question was answered
    if (selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(prevScore => prevScore + 1);
    }
    
    try {
      // Update participant score
      await supabase
        .from('quiz_participants')
        .update({
          score,
          status: 'completed'
        })
        .eq('room_id', roomId)
        .eq('user_id', user?.id);
      
      // If user is host, update room status
      if (room?.host_id === user?.id) {
        await supabase
          .from('quiz_rooms')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', roomId);
      }
      
      // Fetch participants for leaderboard
      const { data: participantsData } = await supabase
        .from('quiz_participants')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('room_id', roomId)
        .order('score', { ascending: false });
      
      if (participantsData) {
        setParticipants(participantsData);
      }
      
      // Set quiz as completed to show leaderboard
      setQuizCompleted(true);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to submit your quiz results');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-muted-foreground mb-6">Your score: {score} out of {questions.length}</p>
          
          <div className="my-8">
            <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant, index) => (
                  <TableRow key={participant.id} className={participant.user_id === user?.id ? "bg-muted/50" : ""}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{participant.profiles?.full_name || 'Unknown User'}</TableCell>
                    <TableCell className="text-right">{participant.score}/{questions.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Button onClick={() => navigate('/quiz-battles')} className="mt-4">
            Return to Quiz Battles
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const formattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{quiz?.title}</h2>
            <p className="text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{formattedTime()}</div>
            <p className="text-muted-foreground">Time remaining</p>
          </div>
        </div>
        
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="mb-6" />
        
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">{currentQuestion?.question_text}</h3>
          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span> {option}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">Score: {score}</p>
          </div>
          <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizTaking;
