
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Quiz, QuizQuestion, QuizRoom, QuizParticipant } from '@/types/quiz';

const QuizTaking = () => {
  const { user } = useAuth();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortedParticipants, setSortedParticipants] = useState<QuizParticipant[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const fetchQuizData = async () => {
      try {
        // Fetch room details
        const { data: roomData, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) throw roomError;
        setRoom(roomData as QuizRoom);

        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', roomData.quiz_id)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData as Quiz);

        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', roomData.quiz_id)
          .order('order_position', { ascending: true });

        if (questionError) throw questionError;
        setQuestions(questionData as QuizQuestion[]);

        // Fetch participants with their profiles
        const { data: participantData, error: participantError } = await supabase
          .from('quiz_participants')
          .select(`
            *,
            profile:profiles(id, full_name, avatar_url)
          `)
          .eq('room_id', roomId);

        if (participantError) throw participantError;
        
        // Type assertion with the correct type after validating the data
        const typedParticipants = participantData?.map(participant => ({
          ...participant,
          profile: participant.profile || {
            id: participant.user_id,
            full_name: 'Unknown',
            avatar_url: null
          }
        })) as QuizParticipant[];
        
        setParticipants(typedParticipants);

        setTimeRemaining(quizData.time_limit * 60); // Time in seconds
        setIsLoading(false);
      } catch (error: any) {
        toast.error('Failed to load quiz data');
        console.error(error);
      }
    };

    fetchQuizData();

    // Set up realtime subscription for participants
    const participantsChannel = supabase
      .channel('quiz_participants_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_participants' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchUpdatedParticipants();
          }
        }
      )
      .subscribe();

    // Set up a timer if the quiz is active
    let timerInterval: NodeJS.Timeout;
    if (room?.status === 'active') {
      timerInterval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      supabase.removeChannel(participantsChannel);
      clearInterval(timerInterval);
    };
  }, [roomId, room?.status]);

  // Update sorted participants whenever participants change
  useEffect(() => {
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    setSortedParticipants(sorted);
  }, [participants]);

  const fetchUpdatedParticipants = async () => {
    try {
      const { data: participantData, error: participantError } = await supabase
        .from('quiz_participants')
        .select(`
          *,
          profile:profiles(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId);

      if (participantError) throw participantError;

      // Type assertion with the correct type after validating the data
      const typedParticipants = participantData?.map(participant => ({
        ...participant,
        profile: participant.profile || {
          id: participant.user_id,
          full_name: 'Unknown',
          avatar_url: null
        }
      })) as QuizParticipant[];
      
      setParticipants(typedParticipants);
    } catch (error: any) {
      console.error('Failed to update participants', error);
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

    // Check if the answer is correct
    if (questions[currentQuestionIndex].correct_answer === selectedAnswer) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedAnswer(null); // Reset selected answer

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // If it's the last question, finish the quiz
      await finishQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    try {
      // Update participant's score and status
      const { error } = await supabase
        .from('quiz_participants')
        .update({
          score: score,
          status: 'finished'
        })
        .eq('room_id', roomId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Quiz finished!');
    } catch (error: any) {
      toast.error('Failed to submit quiz');
      console.error(error);
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

  if (isLoading) {
    return <div className="container mx-auto">Loading quiz data...</div>;
  }

  if (!quiz || !room) {
    return <div className="container mx-auto">Quiz not found</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {room.status === 'waiting' ? (
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold mb-4">Waiting Room</h2>
              {room.host_id === user?.id ? (
                <>
                  <p className="mb-4">You are the host of this quiz. Start the quiz when all participants have joined.</p>
                  <Button onClick={startQuiz} className="mb-4">Start Quiz</Button>
                </>
              ) : (
                <p>Waiting for the host to start the quiz. Please stand by...</p>
              )}
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Participants in waiting room:</h3>
                <ul className="space-y-1">
                  {participants.map(participant => (
                    <li key={participant.id} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{participant.profile?.full_name || 'Unknown'}</span>
                    </li>
                  ))}
                </ul>
                {participants.length === 0 && (
                  <p className="text-muted-foreground">No participants yet</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {isFinished ? (
                <div className="text-center p-4">
                  <h2 className="text-2xl font-bold mb-6">Quiz Complete!</h2>
                  <p className="text-lg mb-8">Your Score: {score} / {questions.length}</p>
                  
                  <div className="bg-muted p-6 rounded-lg max-w-lg mx-auto mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Award className="h-8 w-8 text-yellow-500 mr-2" />
                      <h3 className="text-xl font-bold">Leaderboard</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {sortedParticipants.map((participant, index) => (
                        <div 
                          key={participant.id} 
                          className={`flex items-center justify-between p-3 rounded-md ${
                            index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                            index === 1 ? 'bg-gray-100 dark:bg-gray-800' : 
                            index === 2 ? 'bg-amber-100 dark:bg-amber-900/20' : ''
                          } ${participant.user_id === user?.id ? 'border-2 border-primary' : ''}`}
                        >
                          <div className="flex items-center">
                            <span className="font-bold w-8">{index + 1}.</span>
                            <span>{participant.profile?.full_name || 'Unknown'}</span>
                            {participant.user_id === user?.id && (
                              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                          <span className="font-bold">{participant.score} pts</span>
                        </div>
                      ))}
                      
                      {sortedParticipants.length === 0 && (
                        <p className="text-center text-muted-foreground">No participants yet</p>
                      )}
                    </div>
                  </div>
                  
                  <Button onClick={() => navigate('/quiz-battles')} variant="outline">
                    Back to Quiz Battles
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                      <span>Time Remaining: {formatTime(timeRemaining)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{currentQuestion.question_text}</h3>
                    <ul className="space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <li key={index}>
                          <Button
                            variant={selectedAnswer === index ? 'secondary' : 'outline'}
                            className="w-full"
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaking;
