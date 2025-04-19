
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuizQuestion, QuizParticipant } from '@/types/quiz';

const QuizTaking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';

  // Fetch room details, including quiz information
  const { data: room, isLoading: isRoomLoading } = useQuery({
    queryKey: ['quiz-room', roomId],
    queryFn: async () => {
      if (!roomId) return null;
      
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select(`
          *,
          quiz:quizzes (
            *
          )
        `)
        .eq('id', roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!roomId,
  });

  // Fetch questions for the quiz
  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['quiz-questions', room?.quiz_id],
    queryFn: async () => {
      if (!room?.quiz_id) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', room.quiz_id)
        .order('order_position', { ascending: true });
      
      if (error) throw error;
      return data as QuizQuestion[];
    },
    enabled: !!room?.quiz_id && hasStarted,
  });

  // Fetch participants
  useEffect(() => {
    if (roomId) {
      const fetchParticipants = async () => {
        const { data, error } = await supabase
          .from('quiz_participants')
          .select(`
            *,
            profile:profiles (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('room_id', roomId)
          .order('score', { ascending: false });
          
        if (!error && data) {
          setParticipants(data as QuizParticipant[]);
        }
      };
      
      fetchParticipants();
      
      // Set up real-time subscription for participants
      const participantsSubscription = supabase
        .channel('participants_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'quiz_participants', filter: `room_id=eq.${roomId}` },
          () => {
            fetchParticipants();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(participantsSubscription);
      };
    }
  }, [roomId]);

  // Set up real-time subscription for room status
  useEffect(() => {
    if (roomId) {
      const fetchRoomStatus = async () => {
        const { data, error } = await supabase
          .from('quiz_rooms')
          .select('status, started_at')
          .eq('id', roomId)
          .single();
          
        if (!error && data) {
          setRoomStatus(data.status);
          if (data.status === 'active' && data.started_at) {
            setHasStarted(true);
          }
        }
      };
      
      fetchRoomStatus();
      
      const roomSubscription = supabase
        .channel('room_status_changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` },
          (payload) => {
            const newStatus = payload.new.status;
            setRoomStatus(newStatus);
            
            // If the room status changes to active, start the quiz
            if (newStatus === 'active' && payload.new.started_at) {
              setHasStarted(true);
              toast.success('The quiz has started!');
            }
            
            // If the room status changes to completed, show results
            if (newStatus === 'completed') {
              toast.info('The quiz has ended. Viewing results...');
              // TODO: Navigate to results page or show results
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(roomSubscription);
      };
    }
  }, [roomId]);

  // Set up timer
  useEffect(() => {
    if (hasStarted && room?.quiz?.time_limit) {
      const timeLimit = room.quiz.time_limit * 60; // Convert to seconds
      setRemainingTime(timeLimit);
      
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime === null || prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [hasStarted, room?.quiz?.time_limit]);

  // Format time
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const currentQ = questions[currentQuestion];
      const isCorrect = selectedOption === currentQ.correct_answer;
      
      // Record the answer
      await supabase.rpc('increment', {
        row_id: participants.find(p => p.user_id === user?.id)?.id,
        inc: isCorrect ? 1 : 0
      });
      
      if (isCorrect) {
        toast.success('Correct answer!');
      } else {
        toast.error(`Incorrect. The correct answer was: ${currentQ.options[currentQ.correct_answer]}`);
      }
      
      // Move to next question or end quiz
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        toast.info('You have completed the quiz!');
        // TODO: Show completion screen or navigate to results
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startQuiz = async () => {
    if (!isInstructor) {
      toast.error('Only the instructor can start the quiz');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ 
          status: 'active',
          started_at: new Date().toISOString() 
        })
        .eq('id', roomId);
        
      if (error) throw error;
      
      setHasStarted(true);
      toast.success('Quiz started!');
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast.error('Failed to start quiz');
    }
  };

  if (isRoomLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-24 w-full mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Room Not Found</h2>
        <p className="mb-6">The quiz room you're looking for doesn't exist or has ended.</p>
        <Button onClick={() => navigate('/quiz-battle')}>
          Back to Quiz Battle
        </Button>
      </div>
    );
  }

  // Waiting room
  if (!hasStarted) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Waiting for Quiz to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-2">Room Code: {room.room_code}</Badge>
              <h3 className="text-xl font-semibold mb-2">{room.quiz?.title}</h3>
              <p className="text-muted-foreground">
                {room.quiz?.question_count} questions • {room.quiz?.time_limit} minutes • {room.quiz?.difficulty} difficulty
              </p>
            </div>
            
            <div className="border rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Participants ({participants.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>{participant.profile?.full_name || 'Anonymous'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {isInstructor && room.host_id === user?.id && (
              <div className="text-center">
                <Button onClick={startQuiz} size="lg">
                  Start Quiz
                </Button>
              </div>
            )}
            
            {!isInstructor && (
              <div className="text-center text-muted-foreground">
                <Clock className="inline-block mr-2" size={18} />
                Waiting for the instructor to start the quiz...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz
  if (questions.length === 0 || isQuestionsLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Loading Questions...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline">
              Question {currentQuestion + 1}/{questions.length}
            </Badge>
            {remainingTime !== null && (
              <Badge variant={remainingTime < 60 ? "destructive" : "outline"}>
                <Clock className="mr-1 h-4 w-4" />
                {formatTime(remainingTime)}
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-6">{currentQ.question_text}</h3>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index ? "default" : "outline"}
                className="w-full justify-start text-left p-4 h-auto"
                onClick={() => handleOptionSelect(index)}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="ml-auto"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizTaking;
