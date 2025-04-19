
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const QuizTaking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizEnded, setQuizEnded] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';
  const isHost = room?.host_id === user?.id;
  const isWaiting = room?.status === 'waiting';
  const isActive = room?.status === 'active';
  const isCompleted = room?.status === 'completed';

  useEffect(() => {
    fetchRoomData();
    
    // Set up realtime subscriptions
    const roomChannel = supabase
      .channel('room_status_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` }, 
        (payload) => {
          if (payload.new.status !== payload.old.status) {
            fetchRoomData();
          }
        }
      )
      .subscribe();
      
    const participantsChannel = supabase
      .channel('participants_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'quiz_participants', filter: `room_id=eq.${roomId}` }, 
        () => {
          fetchParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [roomId]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    
    if (isActive && timeLeft > 0 && !isAnswerSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-submit blank answer when time runs out
            if (!isAnswerSubmitted) {
              submitAnswer(null);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isActive, timeLeft, isAnswerSubmitted]);

  const fetchRoomData = async () => {
    try {
      setIsLoading(true);
      
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
        
      if (roomError) throw roomError;
      setRoom(roomData);
      
      // Get quiz data
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', roomData.quiz_id)
        .single();
        
      if (quizError) throw quizError;
      setQuiz(quizData);
      
      // Get quiz questions
      if (isInstructor || roomData.status !== 'waiting') {
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', roomData.quiz_id)
          .order('order_position', { ascending: true });
          
        if (questionsError) throw questionsError;
        setQuestions(questionsData);
        
        // Initialize timer if quiz is active
        if (roomData.status === 'active' && quizData.time_limit) {
          setTimeLeft(quizData.time_limit * 60);
        }
      }
      
      fetchParticipants();
      
      if (roomData.status === 'completed') {
        fetchResults();
      }
      
    } catch (error: any) {
      toast.error('Failed to load quiz data');
      console.error(error);
      navigate('/quiz-battles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_participants')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId);
        
      if (error) throw error;
      setParticipants(data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_participants')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('score', { ascending: false });
        
      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const startQuiz = async () => {
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
    } catch (error: any) {
      toast.error('Failed to start quiz');
      console.error(error);
    }
  };

  const submitAnswer = async (answerIndex: number | null) => {
    if (!user || isAnswerSubmitted) return;
    
    try {
      setIsAnswerSubmitted(true);
      
      // Check if answer is correct
      const currentQuestion = questions[currentQuestionIndex];
      const isCorrect = answerIndex === currentQuestion.correct_answer;
      
      // Update participant score if answer is correct
      if (isCorrect) {
        const { error } = await supabase
          .from('quiz_participants')
          .update({ 
            score: supabase.rpc('increment', { inc: 1 }) 
          })
          .eq('room_id', roomId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      }
      
      // Show feedback
      if (answerIndex !== null) {
        if (isCorrect) {
          toast.success('Correct answer!');
        } else {
          toast.error('Incorrect answer!');
        }
      } else {
        toast.warning('Time's up!');
      }
      
      // Wait 2 seconds to show feedback before moving to next question
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setTimeLeft(quiz.time_limit * 60);
        } else {
          // If this was the last question, end the quiz if user is host
          if (isHost) {
            endQuiz();
          } else {
            setQuizEnded(true);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
      setIsAnswerSubmitted(false);
    }
  };

  const endQuiz = async () => {
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString() 
        })
        .eq('id', roomId)
        .eq('host_id', user?.id); // Make sure only the host can end the quiz

      if (error) throw error;

      setQuizEnded(true);
      fetchResults();
      toast.success('Quiz completed!');
    } catch (error: any) {
      toast.error('Failed to end quiz');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>Waiting Room: {quiz?.title}</div>
              <Badge variant="outline">Code: {room?.room_code}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="flex items-center text-amber-500 mb-4">
                <AlertCircle className="h-8 w-8 mr-2" />
                <h2 className="text-2xl font-bold">Waiting for host to start</h2>
              </div>

              <p className="text-muted-foreground mb-8">
                {isHost 
                  ? "Start the quiz when all participants have joined." 
                  : "The quiz will begin when the host starts it."}
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{participants.length} participants</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center gap-2 p-2 border rounded">
                    {participant.profiles?.avatar_url ? (
                      <img 
                        src={participant.profiles.avatar_url} 
                        alt={participant.profiles.full_name}
                        className="h-6 w-6 rounded-full" 
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        {participant.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className="text-sm truncate">{participant.profiles?.full_name}</span>
                  </div>
                ))}
              </div>

              {isHost && (
                <Button onClick={startQuiz} size="lg">
                  Start Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted || quizEnded) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Quiz Results: {quiz?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
            </div>
            
            <div className="space-y-2">
              {results.map((participant, index) => (
                <div 
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    index === 1 ? 'bg-gray-100 dark:bg-gray-800/50' :
                    index === 2 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-bold w-6 text-center">{index + 1}</div>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {participant.profiles?.avatar_url ? (
                        <img 
                          src={participant.profiles.avatar_url} 
                          alt={participant.profiles.full_name}
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        participant.profiles?.full_name?.charAt(0) || '?'
                      )}
                    </div>
                    <span>{participant.profiles?.full_name}</span>
                  </div>
                  <div className="font-semibold">
                    {participant.score} points
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button onClick={() => navigate('/quiz-battles')}>
                Return to Quiz Battles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isActive && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="container max-w-3xl mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
              <div className="text-xl font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(timeLeft / (quiz.time_limit * 60)) * 100}%` }}
              ></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-4">
              <h3 className="text-xl font-semibold mb-6">{currentQuestion.question_text}</h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswer === index 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card hover:bg-accent'
                    } ${
                      isAnswerSubmitted && index === currentQuestion.correct_answer
                        ? 'bg-green-100 border-green-500 dark:bg-green-900/30'
                        : isAnswerSubmitted && selectedAnswer === index && selectedAnswer !== currentQuestion.correct_answer
                          ? 'bg-red-100 border-red-500 dark:bg-red-900/30'
                          : ''
                    }`}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={isAnswerSubmitted}
                  >
                    <div className="flex items-start">
                      <div className="text-lg font-medium">{option}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {isAnswerSubmitted && currentQuestion.explanation && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium">Explanation:</p>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                {!isAnswerSubmitted ? (
                  <Button 
                    onClick={() => submitAnswer(selectedAnswer)}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Advancing to next question...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isHost && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={endQuiz}>
              End Quiz Early
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4 text-center">
      <Card>
        <CardContent className="pt-6">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">Unable to load the quiz content.</p>
          <Button onClick={() => navigate('/quiz-battles')}>
            Return to Quiz Battles
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaking;
