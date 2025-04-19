
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { QuizQuestion, QuizRoom, QuizParticipant } from '@/types/quiz';

const QuizTaking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  // Load quiz data
  useEffect(() => {
    if (!roomId || !user) return;
    
    const fetchQuizData = async () => {
      setIsLoading(true);
      try {
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
        
        // Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', roomData.quiz_id)
          .order('order_position', { ascending: true });
          
        if (questionsError) throw questionsError;
        
        setQuestions(questionsData);
        
        // If the room status is 'waiting', update it to 'active' when the first participant joins
        if (roomData.status === 'waiting') {
          const { error: updateError } = await supabase
            .from('quiz_rooms')
            .update({ status: 'active', started_at: new Date().toISOString() })
            .eq('id', roomId);
            
          if (updateError) throw updateError;
        }
        
        // Set time remaining
        if (quizData.time_limit) {
          setTimeRemaining(quizData.time_limit * 60); // Convert minutes to seconds
        }
        
      } catch (error: any) {
        toast.error(error.message);
        console.error('Error fetching quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [roomId, user]);
  
  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, quizCompleted]);
  
  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };
  
  const handleNextQuestion = async () => {
    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }
    
    // Check if answer is correct
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedOption === currentQ.correct_answer;
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      // Update participant score in the database
      if (user && roomId) {
        await supabase
          .from('quiz_participants')
          .update({ score: score + 1 })
          .match({ room_id: roomId, user_id: user.id });
      }
    }
    
    // Move to next question or complete quiz
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleQuizComplete();
    }
  };
  
  const handleQuizComplete = async () => {
    if (quizCompleted) return;
    
    setQuizCompleted(true);
    
    // Update participant status to completed
    if (user && roomId) {
      await supabase
        .from('quiz_participants')
        .update({ 
          status: 'completed',
          score: score
        })
        .match({ room_id: roomId, user_id: user.id });
      
      // Check if all participants completed
      const { data: activeParticipants } = await supabase
        .from('quiz_participants')
        .select('count')
        .eq('room_id', roomId)
        .eq('status', 'active');
      
      // If all participants completed, update room status
      if (!activeParticipants || activeParticipants.length === 0) {
        await supabase
          .from('quiz_rooms')
          .update({ 
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', roomId);
      }
      
      // Fetch participants for leaderboard
      fetchLeaderboard();
    }
  };
  
  const fetchLeaderboard = async () => {
    if (!roomId) return;
    
    try {
      // Get all participants with scores
      const { data: participantsData, error: participantsError } = await supabase
        .from('quiz_participants')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false });
        
      if (participantsError) throw participantsError;
      
      setParticipants(participantsData);
      
      // Get user profiles for names
      const userIds = participantsData.map(p => p.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Create lookup object for profiles
      const profilesMap: Record<string, any> = {};
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      setUserProfiles(profilesMap);
      
    } catch (error: any) {
      toast.error('Failed to load leaderboard');
      console.error('Error fetching leaderboard data:', error);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }
  
  if (!room || !quiz || questions.length === 0) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <p className="text-muted-foreground mb-6">This quiz room does not exist or has been closed.</p>
        <Button onClick={() => navigate('/quiz-battles')}>Back to Quiz Battles</Button>
      </div>
    );
  }
  
  // Display leaderboard after quiz completion
  if (quizCompleted) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-6">
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-lg font-medium">Your Score: {score} / {questions.length}</p>
            <p className="text-muted-foreground">
              ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant, index) => (
                <TableRow key={participant.id} className={participant.user_id === user?.id ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </TableCell>
                  <TableCell>
                    {userProfiles[participant.user_id]?.full_name || 'Unknown Player'}
                  </TableCell>
                  <TableCell className="text-right">
                    {participant.score} / {questions.length}
                  </TableCell>
                  <TableCell className="text-right">
                    {Math.round((participant.score / questions.length) * 100)}%
                  </TableCell>
                </TableRow>
              ))}
              {participants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No participants yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="mt-6 text-center">
            <Button onClick={() => navigate('/quiz-battles')}>
              Return to Quiz Battles
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Display current question
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  
  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">{quiz.title}</h2>
            <p className="text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">{formatTime(timeRemaining)}</div>
            <p className="text-muted-foreground">Time Remaining</p>
          </div>
        </div>
        
        <Progress value={progress} className="mb-6" />
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">{currentQ.question_text}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOption === index 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSelectOption(index)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizTaking;
