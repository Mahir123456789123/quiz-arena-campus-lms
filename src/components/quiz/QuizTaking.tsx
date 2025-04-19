import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
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
    return <div className="container mx-auto">Loading...</div>;
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
          {room.status === 'waiting' && room.host_id === user?.id ? (
            <div className="text-center">
              <p>Waiting for the host to start the quiz...</p>
              <Button onClick={startQuiz}>Start Quiz</Button>
            </div>
          ) : (
            <>
              {isFinished ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
                  <p className="text-lg">Your Score: {score} / {questions.length}</p>
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
        <CardFooter>
          <h4 className="text-sm font-semibold">Participants</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map(participant => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.profile?.full_name || 'Unknown'}</TableCell>
                  <TableCell className="text-right">{participant.score}</TableCell>
                  <TableCell className="text-right">{participant.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizTaking;
