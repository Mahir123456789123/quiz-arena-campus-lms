
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Award, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quiz, QuizQuestion, QuizRoom, QuizParticipant } from '@/types/quiz';

interface QuizTakingProps {
  roomId: string;
}

const QuizTaking: React.FC<QuizTakingProps> = ({ roomId }) => {
  const { user, profile } = useAuth();
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
  const [error, setError] = useState<string | null>(null);
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';

  console.log("Room ID:", roomId);
  console.log("User ID:", user?.id);

  useEffect(() => {
    if (!roomId) {
      setError("No room ID provided");
      return;
    }

    const fetchQuizData = async () => {
      try {
        console.log("Fetching quiz data for room:", roomId);
        // Fetch room details
        const { data: roomData, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) {
          console.error("Room error:", roomError);
          setError("Failed to load quiz room data");
          throw roomError;
        }
        
        console.log("Room data:", roomData);
        setRoom(roomData as QuizRoom);

        // Check if the user is already a participant (if not the host)
        if (user?.id && roomData.host_id !== user.id) {
          await joinQuizRoomIfNeeded(roomData.id);
        }

        // Fetch quiz details
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', roomData.quiz_id)
          .single();

        if (quizError) {
          console.error("Quiz error:", quizError);
          setError("Failed to load quiz data");
          throw quizError;
        }
        
        console.log("Quiz data:", quizData);
        setQuiz(quizData as Quiz);

        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', roomData.quiz_id)
          .order('order_position', { ascending: true });

        if (questionError) {
          console.error("Questions error:", questionError);
          setError("Failed to load quiz questions");
          throw questionError;
        }
        
        console.log("Question data:", questionData);
        setQuestions(questionData as QuizQuestion[]);

        // Fetch participants with their profiles
        await fetchUpdatedParticipants();

        setTimeRemaining(quizData.time_limit * 60); // Time in seconds
        setIsLoading(false);
      } catch (error: any) {
        console.error("Failed to load quiz data:", error);
        toast.error('Failed to load quiz data');
        setIsLoading(false);
      }
    };

    fetchQuizData();

    // Set up realtime subscription for participants
    const participantsChannel = supabase
      .channel('quiz_participants_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          console.log("Participants updated:", payload);
          fetchUpdatedParticipants();
        }
      )
      .subscribe();

    // Set up realtime subscription for room status
    const roomsChannel = supabase
      .channel('quiz_rooms_changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          console.log("Room updated:", payload);
          // @ts-ignore
          const newRoom = payload.new as QuizRoom;
          setRoom(newRoom);
          
          // @ts-ignore
          if (newRoom.status === 'active' && room?.status === 'waiting') {
            toast.success('Quiz has started!');
          }
          
          // @ts-ignore
          if (newRoom.status === 'completed' && room?.status !== 'completed') {
            setIsFinished(true);
            fetchUpdatedParticipants();
            toast.success('Quiz has ended!');
          }
        }
      )
      .subscribe();

    // Set up a timer if the quiz is active
    let timerInterval: NodeJS.Timeout | undefined;
    if (room?.status === 'active') {
      timerInterval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 0) {
            if (timerInterval) clearInterval(timerInterval);
            finishQuiz();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(roomsChannel);
    };
  }, [roomId, user?.id]);

  // Join the room if the user is not already a participant
  const joinQuizRoomIfNeeded = async (roomId: string) => {
    if (!user?.id) {
      console.error("Cannot join room: No user ID");
      return;
    }
    
    try {
      console.log("Checking if user is already a participant", user.id);
      // Check if user is already a participant
      const { data: existingParticipant, error: participantError } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participantError) {
        console.error("Error checking participant:", participantError);
      }

      console.log("Existing participant:", existingParticipant);

      // If not already joined, add as participant
      if (!existingParticipant) {
        console.log("Joining room as new participant");
        const { error } = await supabase
          .from('quiz_participants')
          .insert({
            room_id: roomId,
            user_id: user.id,
            score: 0,
            status: 'active'
          });

        if (error) {
          console.error("Failed to join room:", error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Join room error:", error);
    }
  };

  // Update sorted participants whenever participants change
  useEffect(() => {
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    setSortedParticipants(sorted);
  }, [participants]);

  const fetchUpdatedParticipants = async () => {
    try {
      console.log("Fetching participants for room:", roomId);
      const { data: participantData, error: participantError } = await supabase
        .from('quiz_participants')
        .select(`
          *,
          profile:profiles(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId);

      if (participantError) {
        console.error("Participants fetch error:", participantError);
        throw participantError;
      }

      console.log("Participant data:", participantData);

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
      
      // Update score in the database
      try {
        const { data: participant, error: getError } = await supabase
          .from('quiz_participants')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', user?.id)
          .single();
        
        if (getError) throw getError;
        
        const { error: updateError } = await supabase
          .from('quiz_participants')
          .update({ score: (participant.score || 0) + 1 })
          .eq('room_id', roomId)
          .eq('user_id', user?.id);
          
        if (updateError) throw updateError;
      } catch (error) {
        console.error('Failed to update score:', error);
      }
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
    if (!user?.id) return;
    
    setIsFinished(true);
    try {
      // Update participant's status
      const { error } = await supabase
        .from('quiz_participants')
        .update({
          status: 'finished'
        })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Quiz finished!');
      
      // Fetch final leaderboard
      await fetchUpdatedParticipants();
    } catch (error: any) {
      toast.error('Failed to submit quiz');
      console.error(error);
    }
  };

  const startQuiz = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .eq('host_id', user.id); // Make sure only the host can start the quiz

      if (error) throw error;

      toast.success('Quiz started!');
    } catch (error: any) {
      toast.error('Failed to start quiz');
      console.error(error);
    }
  };

  const endQuiz = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('quiz_rooms')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', roomId)
        .eq('host_id', user.id); // Make sure only the host can end the quiz

      if (error) throw error;

      toast.success('Quiz ended');
      setIsFinished(true);
    } catch (error: any) {
      toast.error('Failed to end quiz');
      console.error(error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => navigate('/quiz-battles')} className="mt-4">
              Back to Quiz Battles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <p className="text-center mt-4">Loading quiz data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || !room) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Quiz not found</p>
            <Button onClick={() => navigate('/quiz-battles')} className="mt-4">
              Back to Quiz Battles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isHost = room.host_id === user?.id;

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
              <div className="bg-muted p-4 rounded-md mb-4">
                <p className="font-semibold">Room Code: <span className="text-primary text-xl">{room.room_code}</span></p>
                <p className="text-sm text-muted-foreground">Share this code with students to join</p>
              </div>
              
              {isHost ? (
                <>
                  <p className="mb-4">You are the host of this quiz. Start the quiz when all participants have joined.</p>
                  <Button onClick={startQuiz} className="mb-4">Start Quiz</Button>
                </>
              ) : (
                <p>Waiting for the host to start the quiz. Please stand by...</p>
              )}
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Participants in waiting room:</h3>
                {participants.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map(participant => (
                          <TableRow key={participant.id}>
                            <TableCell>
                              {participant.profile?.full_name || 'Unknown'}
                              {participant.user_id === user?.id && (
                                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Ready
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No participants yet</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {isFinished || room.status === 'completed' ? (
                <div className="text-center p-4">
                  <h2 className="text-2xl font-bold mb-6">Quiz Complete!</h2>
                  {!isHost && (
                    <p className="text-lg mb-8">Your Score: {score} / {questions.length}</p>
                  )}
                  
                  <div className="bg-muted p-6 rounded-lg max-w-lg mx-auto mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
                      <h3 className="text-xl font-bold">Leaderboard</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {sortedParticipants.length > 0 ? (
                        sortedParticipants.map((participant, index) => (
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
                        ))
                      ) : (
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
                  <div className="mb-4 flex justify-between items-center">
                    <div className="w-full mr-4">
                      <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>Time Remaining: {formatTime(timeRemaining)}</span>
                      </div>
                    </div>
                    
                    {isHost && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={endQuiz}
                      >
                        End Quiz
                      </Button>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">{currentQuestion?.question_text}</h3>
                    {currentQuestion?.options ? (
                      <ul className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
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
                    ) : (
                      <p className="text-red-500">No options available for this question</p>
                    )}
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
