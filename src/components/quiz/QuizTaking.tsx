
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Clock, Zap, Shield, Timer, Star } from 'lucide-react';
import type { QuizParticipant } from '@/types/quiz';

const QuizTaking = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [gameState, setGameState] = useState<'loading' | 'waiting' | 'active' | 'completed'>('loading');
  const [quizData, setQuizData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [powerUps, setPowerUps] = useState({
    doublePoints: 1,
    freezeTime: 1,
    skipQuestion: 1
  });
  const [reaction, setReaction] = useState<string | null>(null);
  const [theme, setTheme] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hostProfile, setHostProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'active' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && gameState === 'active') {
      // Move to next question or submit if last question
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timer, gameState]);

  // Fetch quiz data
  useEffect(() => {
    if (!roomId || !user) return;
    
    const fetchQuizData = async () => {
      try {
        // Check if the room exists and get the quiz ID
        const { data: roomData, error: roomError } = await supabase
          .from('quiz_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) {
          toast.error('Room not found');
          navigate('/quiz-battles');
          return;
        }

        // Get the host profile info
        const { data: hostProfile, error: hostError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', roomData.host_id)
          .single();

        if (!hostError) {
          setHostProfile(hostProfile);
        }

        // Get user profile
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!userError) {
          setUserProfile(userProfile);
        }

        // Get the quiz data
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', roomData.quiz_id)
          .single();

        if (quizError) {
          toast.error('Quiz not found');
          navigate('/quiz-battles');
          return;
        }

        // Get the quiz questions
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_position', { ascending: true });

        if (questionError) {
          toast.error('Failed to load questions');
          return;
        }

        // Get participants
        const { data: participantData, error: participantError } = await supabase
          .from('quiz_participants')
          .select('*')
          .eq('room_id', roomId);

        if (participantError) {
          toast.error('Failed to load participants');
        } else {
          // Convert string status to enum type
          const typedParticipants = participantData.map(p => ({
            ...p,
            status: p.status as QuizParticipant['status']
          }));

          setParticipants(typedParticipants);
        }

        setQuizData(quizData);
        setQuestions(questionData);
        setGameState(roomData.status === 'waiting' ? 'waiting' : 'active');

        // Initialize timer based on quiz settings
        if (roomData.status === 'active') {
          setTimer(quizData.time_limit || 15);
        }

        // Initialize empty user answers array
        setUserAnswers(new Array(questionData.length).fill(-1));

      } catch (error: any) {
        toast.error('Failed to load quiz data');
        console.error(error);
      }
    };

    fetchQuizData();

    // Subscribe to realtime changes for participants
    const participantsSubscription = supabase
      .channel('quiz_participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_participants',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Refresh participants when there's a change
          const { data, error } = await supabase
            .from('quiz_participants')
            .select('*')
            .eq('room_id', roomId);

          if (!error && data) {
            // Convert string status to enum type
            const typedParticipants = data.map(p => ({
              ...p,
              status: p.status as QuizParticipant['status']
            }));
            
            setParticipants(typedParticipants);
          }
        }
      )
      .subscribe();

    // Subscribe to room status changes
    const roomSubscription = supabase
      .channel('quiz_room_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload: any) => {
          if (payload.new.status === 'active' && gameState === 'waiting') {
            toast.info('Quiz has started!');
            setGameState('active');
            setTimer(quizData?.time_limit || 15);
          } else if (payload.new.status === 'completed' && gameState !== 'completed') {
            setGameState('completed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsSubscription);
      supabase.removeChannel(roomSubscription);
    };
  }, [roomId, user, navigate]);

  // Handle answer selection
  const handleAnswer = async (index: number) => {
    if (isSubmitting || gameState !== 'active') return;
    
    // Update user answers
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = index;
    setUserAnswers(newUserAnswers);
    
    const isCorrect = index === questions[currentQuestion].correct_answer;
    
    // Calculate score based on time left (faster = more points)
    const timeBonus = Math.max(5, timer);
    const pointsEarned = isCorrect ? 100 + (timeBonus * 10) : 0;
    
    // Apply double points power-up if active
    const finalPoints = powerUps.doublePoints > 0 ? pointsEarned * 2 : pointsEarned;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + finalPoints);
      
      // Update score in the database
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('quiz_participants')
          .update({ score: score + finalPoints })
          .eq('room_id', roomId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } catch (error: any) {
        console.error('Failed to update score:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
    
    // Show result briefly then move to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prevQ => prevQ + 1);
        setTimer(quizData?.time_limit || 15);
      } else {
        // Complete the quiz
        completeQuiz();
      }
    }, 1500);
  };

  // Handle time up
  const handleTimeUp = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prevQ => prevQ + 1);
      setTimer(quizData?.time_limit || 15);
    } else {
      // Complete the quiz
      completeQuiz();
    }
  };

  // Complete the quiz
  const completeQuiz = async () => {
    if (gameState === 'completed') return;
    
    setIsSubmitting(true);
    try {
      // Update participant status to completed
      const { error: participantError } = await supabase
        .from('quiz_participants')
        .update({ 
          status: 'completed',
          score: score
        })
        .eq('room_id', roomId)
        .eq('user_id', user?.id);

      if (participantError) throw participantError;
      
      setGameState('completed');
    } catch (error: any) {
      toast.error('Failed to complete quiz');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use powerup
  const usePowerUp = (type: 'doublePoints' | 'freezeTime' | 'skipQuestion') => {
    if (powerUps[type] <= 0 || gameState !== 'active') return;
    
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    
    switch (type) {
      case 'doublePoints':
        toast.success('Double points activated for next correct answer!');
        break;
      case 'freezeTime':
        // Add 5 seconds to timer
        setTimer(prev => Math.min(prev + 5, quizData?.time_limit || 15));
        toast.success('Added 5 seconds to the timer!');
        break;
      case 'skipQuestion':
        // Skip to next question
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prevQ => prevQ + 1);
          setTimer(quizData?.time_limit || 15);
          toast.success('Skipped to next question!');
        } else {
          toast.error('No more questions to skip to!');
          // Return the power-up since we couldn't use it
          setPowerUps(prev => ({
            ...prev,
            [type]: prev[type] + 1
          }));
        }
        break;
    }
  };

  // Send reaction
  const sendReaction = (emoji: string) => {
    setReaction(emoji);
    // In a real app, you'd broadcast this to other players
    
    // Auto-clear after 2 seconds
    setTimeout(() => {
      setReaction(null);
    }, 2000);
  };

  // Available reactions
  const reactions = [
    { emoji: '🎯', label: 'Perfect' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '😵', label: 'Confused' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '👏', label: 'Applause' }
  ];

  // Loading state
  if (gameState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Quiz...</div>
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Waiting for quiz to start
  if (gameState === 'waiting') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">{quizData?.title}</h2>
          <p className="mb-6">Waiting for the host to start the quiz...</p>
          
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">Participants ({participants.length})</div>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((participant) => (
                <div key={participant.id} className="text-sm bg-gray-100 p-2 rounded-md">
                  {participant.user_id === user?.id ? 'You' : 'Player'}
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={() => navigate('/quiz-battles')} variant="outline" className="w-full">
            Leave Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Quiz completed, show results
  if (gameState === 'completed') {
    // Sort participants by score (highest first)
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl p-8 mb-6 text-center bg-white">
            <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
            <p className="text-lg mb-6">
              {quizData?.title} - {questions.length} questions
            </p>
            
            {/* Top 3 players podium */}
            <div className="flex justify-center items-end mb-8 h-64">
              {/* 2nd place */}
              {sortedParticipants.length > 1 && (
                <div className="w-1/4 px-2">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold mb-2">
                      2
                    </div>
                    <div className="text-center">
                      <div className="font-bold">
                        {sortedParticipants[1].user_id === user?.id ? 'You' : 'Player 2'}
                      </div>
                      <div className="font-bold text-lg mt-1">{sortedParticipants[1].score}</div>
                    </div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-500 text-4xl">🥈</div>
                    <div className="h-28 w-full rounded-t-lg bg-gray-200 absolute -z-10 bottom-0"></div>
                  </div>
                </div>
              )}
              
              {/* 1st place */}
              {sortedParticipants.length > 0 && (
                <div className="w-1/3 px-2">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500 text-white flex items-center justify-center text-2xl font-bold mb-2">
                      1
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {sortedParticipants[0].user_id === user?.id ? 'You' : 'Player 1'}
                      </div>
                      <div className="font-bold text-xl mt-1">{sortedParticipants[0].score}</div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">👑</div>
                    <div className="h-40 w-full rounded-t-lg bg-blue-200 absolute -z-10 bottom-0"></div>
                  </div>
                </div>
              )}
              
              {/* 3rd place */}
              {sortedParticipants.length > 2 && (
                <div className="w-1/4 px-2">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold mb-2">
                      3
                    </div>
                    <div className="text-center">
                      <div className="font-bold">
                        {sortedParticipants[2].user_id === user?.id ? 'You' : 'Player 3'}
                      </div>
                      <div className="font-bold text-lg mt-1">{sortedParticipants[2].score}</div>
                    </div>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-gray-500 text-4xl">🥉</div>
                    <div className="h-20 w-full rounded-t-lg bg-gray-200 absolute -z-10 bottom-0"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Your performance */}
            <div className="rounded-xl p-6 bg-gray-100 mb-8">
              <h2 className="text-xl font-bold mb-4">Your Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {score}
                  </div>
                  <div className="text-sm opacity-75">Total Score</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {sortedParticipants.findIndex(p => p.user_id === user?.id) + 1}
                  </div>
                  <div className="text-sm opacity-75">Your Rank</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((userAnswers.filter((ans, idx) => ans === questions[idx]?.correct_answer).length / questions.length) * 100)}%
                  </div>
                  <div className="text-sm opacity-75">Accuracy</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {quizData?.time_limit || 15}s
                  </div>
                  <div className="text-sm opacity-75">Time Per Question</div>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/quiz-battles')}
                variant="default"
                className="py-3 px-6"
              >
                Back to Quizzes
              </Button>
            </div>
          </div>
          
          {/* Full Leaderboard */}
          <div className="rounded-xl overflow-hidden mb-6 bg-white">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Full Leaderboard</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Player</th>
                  <th className="px-6 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((participant, index) => (
                  <tr 
                    key={participant.id} 
                    className={`${participant.user_id === user?.id ? 'bg-blue-100' : ''} 
                    ${index !== sortedParticipants.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                    <td className="px-6 py-4">
                      {index === 0 ? <Trophy className="text-yellow-500" size={20} /> : index + 1}
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-blue-500 text-white">
                        {index + 1}
                      </div>
                      <span className="font-medium">
                        {participant.user_id === user?.id ? 'You' : `Player ${index + 1}`}
                      </span>
                      {participant.user_id === user?.id && 
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">YOU</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right font-bold">{participant.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left sidebar - Power-ups & Reactions */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-4 mb-4 bg-white">
            <h3 className="text-lg font-bold mb-3">Power-Ups</h3>
            <div className="space-y-3">
              <button 
                onClick={() => usePowerUp('doublePoints')}
                disabled={powerUps.doublePoints <= 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${
                  powerUps.doublePoints > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 opacity-50'
                } text-white`}
              >
                <div className="flex items-center">
                  <Zap size={18} className="mr-2" />
                  <span>Double Points</span>
                </div>
                <span className="text-sm">{powerUps.doublePoints}x</span>
              </button>
              
              <button 
                onClick={() => usePowerUp('freezeTime')}
                disabled={powerUps.freezeTime <= 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${
                  powerUps.freezeTime > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 opacity-50'
                } text-white`}
              >
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>Extra Time</span>
                </div>
                <span className="text-sm">{powerUps.freezeTime}x</span>
              </button>
              
              <button 
                onClick={() => usePowerUp('skipQuestion')}
                disabled={powerUps.skipQuestion <= 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${
                  powerUps.skipQuestion > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 opacity-50'
                } text-white`}
              >
                <div className="flex items-center">
                  <Shield size={18} className="mr-2" />
                  <span>Skip Question</span>
                </div>
                <span className="text-sm">{powerUps.skipQuestion}x</span>
              </button>
            </div>
          </div>
          
          <div className="rounded-xl p-4 bg-white">
            <h3 className="text-lg font-bold mb-3">Reactions</h3>
            <div className="grid grid-cols-3 gap-2">
              {reactions.map(r => (
                <button 
                  key={r.emoji}
                  onClick={() => sendReaction(r.emoji)}
                  className="p-2 text-2xl rounded-lg hover:scale-110 transition-transform bg-gray-100"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
            
            {reaction && (
              <div className="mt-4 text-center">
                <div className="inline-block text-5xl animate-bounce">
                  {reaction}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Middle - Quiz content */}
        <div className="lg:col-span-2">
          <div className="rounded-xl p-6 bg-white">
            {/* Header with progress and timer */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm">
                Question {currentQuestion + 1}/{questions.length}
              </div>
              
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                timer > 10 ? 'bg-green-500' : timer > 5 ? 'bg-yellow-500' : 'bg-red-500'
              } text-white text-xl font-bold`}>
                {timer}
                <div className="absolute inset-0 rounded-full border-4 border-dashed animate-spin" style={{ animationDuration: '10s' }}></div>
              </div>
              
              <div className="text-sm">
                Score: {score}
              </div>
            </div>
            
            {/* Question */}
            {questions[currentQuestion] && (
              <div className="mt-4 mb-6">
                <h2 className="text-xl font-bold mb-6">
                  {questions[currentQuestion].question_text}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions[currentQuestion].options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="p-4 rounded-lg text-left transition-all bg-gray-100 hover:bg-blue-500 hover:text-white"
                    >
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm bg-blue-600 text-white">
                          {['A', 'B', 'C', 'D'][index]}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Live player activity feed */}
          <div className="mt-4 rounded-xl p-4 bg-white">
            <h3 className="text-lg font-bold mb-2">Live Activity</h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs mr-2">P</div>
                <span className="font-medium">Player 1</span>
                <span className="ml-2 text-gray-400">answered correctly! +230 points</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">P</div>
                <span className="font-medium">Player 2</span>
                <span className="ml-2 text-gray-400">used Double Points power-up!</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">P</div>
                <span className="font-medium">Player 3</span>
                <span className="ml-2 text-gray-400">sent 🔥</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Leaderboard */}
        <div className="lg:col-span-1">
          <div className="rounded-xl p-4 bg-white">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <Trophy size={20} className="mr-2 text-yellow-500" />
              Live Leaderboard
            </h3>
            
            <div className="space-y-3 mt-2">
              {[...participants].sort((a, b) => b.score - a.score).map((participant, index) => (
                <div 
                  key={participant.id}
                  className={`flex items-center p-3 rounded-lg ${
                    participant.user_id === user?.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <div className="w-6 text-center font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mx-2 bg-blue-500 text-white">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {participant.user_id === user?.id ? 'You' : `Player ${index + 1}`}
                    </div>
                  </div>
                  
                  <div className="font-bold">{participant.score}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quiz details */}
          <div className="mt-4 rounded-xl p-4 bg-white">
            <h3 className="text-lg font-bold mb-3">Quiz Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-75">Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Time per question:</span>
                <span className="font-medium">{quizData?.time_limit || 15} seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Players:</span>
                <span className="font-medium">{participants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Points per question:</span>
                <span className="font-medium">Up to 250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
