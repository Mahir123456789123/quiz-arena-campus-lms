
import React, { useState, useEffect } from 'react';
import { UserCircle, Trophy, Clock, Zap, Heart, Shield, Timer, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

// Main component for the Quiz Battle system
const MultiplayerQuizBattle = () => {
  const { user } = useAuth();
  // State management
  const [gameState, setGameState] = useState('lobby'); // lobby, countdown, battle, result
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [powerUps, setPowerUps] = useState({
    doublePoints: 1,
    freezeTime: 1,
    skipQuestion: 1
  });
  const [players, setPlayers] = useState([]);
  const [reaction, setReaction] = useState(null);
  const [theme, setTheme] = useState('default');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  
  // Sample quizzes data
  const quizzes = [
    { 
      id: 1, 
      title: 'Computer Science Fundamentals', 
      difficulty: 'Medium',
      players: 18,
      questions: 10,
      time: '15 min',
      image: 'coding'
    },
    { 
      id: 2, 
      title: 'Physics Champions', 
      difficulty: 'Hard',
      players: 24,
      questions: 15,
      time: '20 min',
      image: 'physics'
    },
    { 
      id: 3, 
      title: 'Literature Masters', 
      difficulty: 'Easy',
      players: 12,
      questions: 8,
      time: '10 min',
      image: 'books'
    },
    { 
      id: 4, 
      title: 'Inter-College Challenge', 
      difficulty: 'Extreme',
      players: 42,
      questions: 20,
      time: '30 min',
      image: 'trophy',
      isSpecial: true
    }
  ];

  // Sample questions data
  const questions = [
    {
      id: 1,
      question: 'What is the time complexity of quicksort in the average case?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctAnswer: 1,
      explanation: 'Quicksort has an average time complexity of O(n log n).'
    },
    {
      id: 2,
      question: 'Which data structure follows the LIFO principle?',
      options: ['Queue', 'Stack', 'Linked List', 'Tree'],
      correctAnswer: 1,
      explanation: 'Stack follows Last In First Out (LIFO) principle.'
    },
    {
      id: 3,
      question: 'What is the output of: console.log(typeof null)?',
      options: ['null', 'undefined', 'object', 'number'],
      correctAnswer: 2,
      explanation: 'In JavaScript, typeof null returns "object", which is actually a known bug.'
    }
  ];

  // Sample players data
  const samplePlayers = [
    { id: 1, name: 'Player123', avatar: 'blue', score: 850, college: 'MIT' },
    { id: 2, name: 'QuizMaster', avatar: 'red', score: 820, college: 'Stanford' },
    { id: 3, name: 'BrainGenius', avatar: 'green', score: 780, college: 'Harvard' },
    { id: 4, name: 'You', avatar: 'purple', score: 750, college: 'Your College', isYou: true },
    { id: 5, name: 'QuizWhiz', avatar: 'orange', score: 720, college: 'Princeton' },
    { id: 6, name: 'ThoughtLeader', avatar: 'yellow', score: 680, college: 'Oxford' }
  ];

  // Themes for the quiz
  const themes = [
    { id: 'default', name: 'Classic', color: 'bg-blue-600' },
    { id: 'neon', name: 'Neon Lights', color: 'bg-pink-600' },
    { id: 'chalkboard', name: 'Chalkboard', color: 'bg-green-700' },
    { id: 'space', name: 'Space Adventure', color: 'bg-purple-800' }
  ];

  // Available reactions
  const reactions = [
    { emoji: '🎯', label: 'Perfect' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '😵', label: 'Confused' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '👏', label: 'Applause' }
  ];

  // Generate a random room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create a new room
  const createRoom = async (quiz) => {
    setIsCreatingRoom(true);
    try {
      const newRoomCode = generateRoomCode();
      setRoomCode(newRoomCode);
      
      // In a real implementation, you would save this to the database
      const { error } = await supabase
        .from('quiz_rooms')
        .insert({
          room_code: newRoomCode,
          quiz_id: quiz.id,
          host_id: user?.id,
          status: 'waiting',
          max_players: 10
        });
        
      if (error) throw error;
      
      setSelectedQuiz(quiz);
      toast.success(`Room created with code: ${newRoomCode}`);
      // Start countdown after room creation
      setGameState('countdown');
      setTimeout(() => {
        setGameState('battle');
        setTimer(15);
      }, 3000);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Join an existing room
  const joinRoom = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    
    setIsJoiningRoom(true);
    try {
      // In a real implementation, you would verify the room code in the database
      const { data, error } = await supabase
        .from('quiz_rooms')
        .select('*')
        .eq('room_code', joinCode)
        .eq('status', 'waiting')
        .single();
        
      if (error) throw error;
      
      if (!data) {
        toast.error("Room not found or game already started");
        return;
      }
      
      // Join the room
      const { error: joinError } = await supabase
        .from('quiz_participants')
        .insert({
          room_id: data.id,
          user_id: user?.id,
          score: 0,
          status: 'active'
        });
        
      if (joinError) throw joinError;
      
      // Find the quiz details
      const quiz = quizzes.find(q => q.id === data.quiz_id) || quizzes[0];
      setSelectedQuiz(quiz);
      setRoomCode(joinCode);
      toast.success(`Joined room: ${joinCode}`);
      
      // Start the game directly for the joining player
      setGameState('battle');
      setTimer(15);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room. Please check the code and try again.");
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameState === 'battle' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && gameState === 'battle') {
      // Move to next question or end if last question
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timer, gameState]);

  // Load players for the leaderboard
  useEffect(() => {
    if (gameState === 'lobby' || gameState === 'battle') {
      setPlayers(samplePlayers);
    }
  }, [gameState]);

  // Handle answer selection
  const handleAnswer = (index) => {
    const isCorrect = index === questions[currentQuestion].correctAnswer;
    
    // Calculate score based on time left (faster = more points)
    const timeBonus = Math.max(5, timer);
    const pointsEarned = isCorrect ? 100 + (timeBonus * 10) : 0;
    
    // Apply double points power-up if active
    const finalPoints = powerUps.doublePoints > 0 ? pointsEarned * 2 : pointsEarned;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + finalPoints);
      
      // Update player in leaderboard
      const updatedPlayers = [...players];
      const playerIndex = updatedPlayers.findIndex(p => p.isYou);
      if (playerIndex !== -1) {
        updatedPlayers[playerIndex].score += finalPoints;
        // Sort players by score
        updatedPlayers.sort((a, b) => b.score - a.score);
        setPlayers(updatedPlayers);
      }

      // In a real implementation, you would update the player's score in the database
      if (roomCode) {
        supabase
          .from('quiz_participants')
          .update({ score: score + finalPoints })
          .eq('user_id', user?.id)
          .eq('room_code', roomCode)
          .then(({ error }) => {
            if (error) console.error("Error updating score:", error);
          });
      }
    }
    
    // Show result briefly then move to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prevQ => prevQ + 1);
        setTimer(15);
      } else {
        setGameState('result');
      }
    }, 1500);
  };

  // Handle time up
  const handleTimeUp = () => {
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prevQ => prevQ + 1);
        setTimer(15);
      } else {
        setGameState('result');
      }
    }, 1000);
  };

  // Handle power-up usage
  const usePowerUp = (type) => {
    if (powerUps[type] <= 0) return;
    
    setPowerUps(prev => ({
      ...prev,
      [type]: prev[type] - 1
    }));
    
    switch (type) {
      case 'doublePoints':
        // Next question will have double points
        toast.success("Double points activated for next correct answer!");
        break;
      case 'freezeTime':
        // Freeze timer for 5 seconds
        toast.success("Time frozen for 5 seconds!");
        // In a real implementation, you'd pause the timer
        break;
      case 'skipQuestion':
        // Skip to next question
        toast.success("Question skipped!");
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prevQ => prevQ + 1);
          setTimer(15);
        }
        break;
      default:
        break;
    }
  };

  // Send reaction
  const sendReaction = (emoji) => {
    setReaction(emoji);
    // In a real app, you'd broadcast this to other players
    
    // Auto-clear after 2 seconds
    setTimeout(() => {
      setReaction(null);
    }, 2000);
  };

  // Change theme
  const changeTheme = (themeId) => {
    setTheme(themeId);
  };

  // Render lobby
  const renderLobby = () => (
    <div className={`min-h-screen p-6 ${theme === 'neon' ? 'bg-black' : theme === 'chalkboard' ? 'bg-green-900' : theme === 'space' ? 'bg-indigo-900' : 'bg-gray-100'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'neon' ? 'text-pink-500' : theme === 'chalkboard' ? 'text-white' : theme === 'space' ? 'text-purple-300' : 'text-gray-800'}`}>
            Multiplayer Quiz Battles
          </h1>
          
          <div className="flex gap-3">
            {themes.map(t => (
              <button 
                key={t.id}
                onClick={() => changeTheme(t.id)}
                className={`px-3 py-2 rounded-lg ${t.color} text-white ${theme === t.id ? 'ring-4 ring-white' : ''}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Join Room Section */}
        <div className={`mb-8 p-6 rounded-xl ${
          theme === 'neon' ? 'bg-gray-900 text-white' : 
          theme === 'chalkboard' ? 'bg-green-800 text-white' : 
          theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
        }`}>
          <h2 className="text-2xl font-bold mb-4">Join a Quiz Battle</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Enter room code (e.g., ABC123)" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className={`${theme === 'neon' ? 'bg-gray-800 border-gray-700' : 
                theme === 'chalkboard' ? 'bg-green-700 border-green-600' : 
                theme === 'space' ? 'bg-indigo-700 border-indigo-600' : ''}`}
              maxLength={6}
            />
            <Button 
              onClick={joinRoom} 
              disabled={isJoiningRoom || !joinCode.trim()}
              className={`${
                theme === 'neon' ? 'bg-pink-600 hover:bg-pink-700' : 
                theme === 'chalkboard' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                theme === 'space' ? 'bg-purple-600 hover:bg-purple-700' : ''
              }`}
            >
              {isJoiningRoom ? 'Joining...' : 'Join Battle'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className={`relative rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-2xl ${
                quiz.isSpecial 
                  ? theme === 'neon' 
                    ? 'border-4 border-pink-500 bg-black text-pink-500' 
                    : theme === 'chalkboard' 
                      ? 'border-4 border-yellow-300 bg-green-800 text-white'
                      : theme === 'space'
                        ? 'border-4 border-purple-400 bg-indigo-800 text-white'
                        : 'border-4 border-yellow-500 bg-white'
                  : theme === 'neon'
                    ? 'bg-gray-900 text-white'
                    : theme === 'chalkboard'
                      ? 'bg-green-800 text-white'
                      : theme === 'space'
                        ? 'bg-indigo-800 text-white'
                        : 'bg-white'
              }`}
            >
              {quiz.isSpecial && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-xs text-black font-bold px-3 py-1 rounded-bl-lg">
                  SPECIAL EVENT
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                <div className="flex items-center text-sm mb-3">
                  <span className={`inline-block px-2 py-1 rounded ${
                    quiz.difficulty === 'Easy' 
                      ? 'bg-green-500 text-white' 
                      : quiz.difficulty === 'Medium'
                        ? 'bg-yellow-500 text-black'
                        : quiz.difficulty === 'Hard'
                          ? 'bg-red-500 text-white'
                          : 'bg-purple-600 text-white'
                  }`}>
                    {quiz.difficulty}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm mb-6">
                  <div className="flex items-center">
                    <UserCircle size={16} className="mr-1" />
                    <span>{quiz.players} players</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{quiz.time}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap size={16} className="mr-1" />
                    <span>{quiz.questions} Qs</span>
                  </div>
                </div>
                
                <button
                  onClick={() => createRoom(quiz)}
                  disabled={isCreatingRoom}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    theme === 'neon'
                      ? 'bg-pink-600 hover:bg-pink-700 text-white'
                      : theme === 'chalkboard'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                        : theme === 'space'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCreatingRoom ? 'Creating Room...' : 'Create Room'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'neon' ? 'text-pink-500' : theme === 'chalkboard' ? 'text-white' : theme === 'space' ? 'text-purple-300' : 'text-gray-800'}`}>
            Top Players
          </h2>
          <div className={`rounded-xl overflow-hidden ${
            theme === 'neon' 
              ? 'bg-gray-900 text-white' 
              : theme === 'chalkboard'
                ? 'bg-green-800 text-white'
                : theme === 'space'
                  ? 'bg-indigo-800 text-white'
                  : 'bg-white'
          }`}>
            <table className="w-full">
              <thead>
                <tr className={theme === 'neon' ? 'border-b border-pink-700' : theme === 'chalkboard' ? 'border-b border-green-600' : theme === 'space' ? 'border-b border-purple-700' : 'border-b'}>
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Player</th>
                  <th className="px-6 py-3 text-left">College</th>
                  <th className="px-6 py-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className={`${player.isYou ? theme === 'neon' ? 'bg-pink-900' : theme === 'chalkboard' ? 'bg-green-700' : theme === 'space' ? 'bg-purple-900' : 'bg-blue-100' : ''} ${
                      index !== players.length - 1 
                        ? theme === 'neon' 
                          ? 'border-b border-gray-800' 
                          : theme === 'chalkboard'
                            ? 'border-b border-green-700'
                            : theme === 'space'
                              ? 'border-b border-indigo-700'
                              : 'border-b border-gray-200'
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      {index === 0 ? (
                        <Trophy size={20} className="text-yellow-500" />
                      ) : index + 1}
                    </td>
                    <td className="px-6 py-4 flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        player.avatar === 'blue' ? 'bg-blue-500' :
                        player.avatar === 'red' ? 'bg-red-500' :
                        player.avatar === 'green' ? 'bg-green-500' :
                        player.avatar === 'purple' ? 'bg-purple-500' :
                        player.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                      } text-white`}>
                        {player.name.charAt(0)}
                      </div>
                      <span className="font-medium">{player.name}</span>
                      {player.isYou && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">YOU</span>}
                    </td>
                    <td className="px-6 py-4">{player.college}</td>
                    <td className="px-6 py-4 text-right font-bold">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Render countdown
  const renderCountdown = () => (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'neon' ? 'bg-black' : 
      theme === 'chalkboard' ? 'bg-green-900' : 
      theme === 'space' ? 'bg-indigo-900' : 'bg-gray-100'
    }`}>
      <div className="text-center">
        <h2 className={`text-2xl mb-6 ${
          theme === 'neon' ? 'text-pink-500' : 
          theme === 'chalkboard' ? 'text-white' : 
          theme === 'space' ? 'text-purple-300' : 'text-gray-800'
        }`}>
          Get Ready for {selectedQuiz?.title}
        </h2>
        <div className={`text-9xl font-bold ${
          theme === 'neon' ? 'text-pink-500' : 
          theme === 'chalkboard' ? 'text-white' : 
          theme === 'space' ? 'text-purple-300' : 'text-blue-600'
        }`}>
          3
        </div>
        <p className={`mt-6 text-lg ${
          theme === 'neon' ? 'text-white' : 
          theme === 'chalkboard' ? 'text-green-100' : 
          theme === 'space' ? 'text-purple-200' : 'text-gray-600'
        }`}>
          {players.length} players are joining this battle
        </p>
        
        {roomCode && (
          <div className="mt-8">
            <div className={`text-sm ${
              theme === 'neon' ? 'text-pink-400' : 
              theme === 'chalkboard' ? 'text-green-200' : 
              theme === 'space' ? 'text-purple-200' : 'text-gray-600'
            }`}>
              Room Code:
            </div>
            <div className={`text-3xl font-mono font-bold tracking-wider ${
              theme === 'neon' ? 'text-white' : 
              theme === 'chalkboard' ? 'text-yellow-300' : 
              theme === 'space' ? 'text-purple-300' : 'text-blue-600'
            }`}>
              {roomCode}
            </div>
            <p className="mt-2 text-sm opacity-75">Share this code with friends to join the battle</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render battle
  const renderBattle = () => (
    <div className={`min-h-screen ${
      theme === 'neon' ? 'bg-black' : 
      theme === 'chalkboard' ? 'bg-green-900' : 
      theme === 'space' ? 'bg-indigo-900' : 'bg-gray-100'
    } p-4`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left sidebar - Power-ups & Reactions */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl p-4 mb-4 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-3">Power-Ups</h3>
            <div className="space-y-3">
              <button 
                onClick={() => usePowerUp('doublePoints')}
                disabled={powerUps.doublePoints <= 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${
                  powerUps.doublePoints > 0 
                    ? theme === 'neon' 
                      ? 'bg-pink-700 hover:bg-pink-800' 
                      : theme === 'chalkboard'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : theme === 'space'
                          ? 'bg-purple-700 hover:bg-purple-800'
                          : 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-500 opacity-50'
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
                  powerUps.freezeTime > 0 
                    ? theme === 'neon' 
                      ? 'bg-pink-700 hover:bg-pink-800' 
                      : theme === 'chalkboard'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : theme === 'space'
                          ? 'bg-purple-700 hover:bg-purple-800'
                          : 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-500 opacity-50'
                } text-white`}
              >
                <div className="flex items-center">
                  <Clock size={18} className="mr-2" />
                  <span>Freeze Time</span>
                </div>
                <span className="text-sm">{powerUps.freezeTime}x</span>
              </button>
              
              <button 
                onClick={() => usePowerUp('skipQuestion')}
                disabled={powerUps.skipQuestion <= 0}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${
                  powerUps.skipQuestion > 0 
                    ? theme === 'neon' 
                      ? 'bg-pink-700 hover:bg-pink-800' 
                      : theme === 'chalkboard'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : theme === 'space'
                          ? 'bg-purple-700 hover:bg-purple-800'
                          : 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-500 opacity-50'
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
          
          <div className={`rounded-xl p-4 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-3">Reactions</h3>
            <div className="grid grid-cols-3 gap-2">
              {reactions.map(r => (
                <button 
                  key={r.emoji}
                  onClick={() => sendReaction(r.emoji)}
                  className={`p-2 text-2xl rounded-lg hover:scale-110 transition-transform ${
                    theme === 'neon' ? 'bg-gray-800' : 
                    theme === 'chalkboard' ? 'bg-green-700' : 
                    theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
                  }`}
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
          <div className={`rounded-xl p-6 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            {/* Room code display */}
            {roomCode && (
              <div className="mb-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                  theme === 'neon' ? 'bg-pink-900 text-pink-200' : 
                  theme === 'chalkboard' ? 'bg-green-700 text-green-200' : 
                  theme === 'space' ? 'bg-indigo-700 text-indigo-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  Room Code: <span className="font-mono font-bold">{roomCode}</span>
                </div>
              </div>
            )}
            
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
            <div className="mt-4 mb-6">
              <h2 className="text-xl font-bold mb-6">
                {questions[currentQuestion].question}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      theme === 'neon' ? 'bg-gray-800 hover:bg-pink-700' : 
                      theme === 'chalkboard' ? 'bg-green-700 hover:bg-yellow-600' : 
                      theme === 'space' ? 'bg-indigo-700 hover:bg-purple-600' : 'bg-gray-100 hover:bg-blue-500 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm ${
                        theme === 'neon' ? 'bg-pink-600' : 
                        theme === 'chalkboard' ? 'bg-yellow-500 text-black' : 
                        theme === 'space' ? 'bg-purple-500' : 'bg-blue-600'
                      } text-white`}>
                        {['A', 'B', 'C', 'D'][index]}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Live player activity feed */}
          <div className={`mt-4 rounded-xl p-4 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-2">Live Activity</h3>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs mr-2">Q</div>
                <span className="font-medium">QuizMaster</span>
                <span className="ml-2 text-gray-400">answered correctly! +230 points</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs mr-2">P</div>
                <span className="font-medium">Player123</span>
                <span className="ml-2 text-gray-400">used Double Points power-up!</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-2">B</div>
                <span className="font-medium">BrainGenius</span>
                <span className="ml-2 text-gray-400">sent 🔥</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - Leaderboard */}
        <div className="lg:col-span-1">
          <div className={`rounded-xl p-4 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <Trophy size={20} className="mr-2 text-yellow-500" />
              Live Leaderboard
            </h3>
            
            <div className="space-y-3 mt-2">
              {players.map((player, index) => (
                <div 
                  key={player.id}
                  className={`flex items-center p-3 rounded-lg ${
                    player.isYou 
                    ? theme === 'neon' 
                      ? 'bg-pink-800' 
                      : theme === 'chalkboard' 
                        ? 'bg-green-700' 
                        : theme === 'space'
                          ? 'bg-purple-700'
                          : 'bg-blue-100'
                    : theme === 'neon'
                      ? 'bg-gray-800'
                      : theme === 'chalkboard'
                        ? 'bg-green-700'
                        : theme === 'space'
                          ? 'bg-indigo-700'
                          : 'bg-gray-100'
                  }`}
                >
                  <div className="w-6 text-center font-bold">
                    {index + 1}
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${
                    player.avatar === 'blue' ? 'bg-blue-500' :
                    player.avatar === 'red' ? 'bg-red-500' :
                    player.avatar === 'green' ? 'bg-green-500' :
                    player.avatar === 'purple' ? 'bg-purple-500' :
                    player.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                  } text-white`}>
                    {player.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">{player.name}</div>
                    <div className="text-xs opacity-75">{player.college}</div>
                  </div>
                  
                  <div className="font-bold">{player.score}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quiz details */}
          <div className={`mt-4 rounded-xl p-4 ${
            theme === 'neon' ? 'bg-gray-900 text-white' : 
            theme === 'chalkboard' ? 'bg-green-800 text-white' : 
            theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-3">Quiz Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="opacity-75">Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Time per question:</span>
                <span className="font-medium">15 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Players:</span>
                <span className="font-medium">{players.length}</span>
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

  // Render results
  const renderResult = () => (
    <div className={`min-h-screen ${
      theme === 'neon' ? 'bg-black' : 
      theme === 'chalkboard' ? 'bg-green-900' : 
      theme === 'space' ? 'bg-indigo-900' : 'bg-gray-100'
    } p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className={`rounded-xl p-8 mb-6 text-center ${
          theme === 'neon' ? 'bg-gray-900 text-white' : 
          theme === 'chalkboard' ? 'bg-green-800 text-white' : 
          theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
        }`}>
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-lg mb-6">
            {selectedQuiz?.title} - {questions.length} questions
          </p>
          
          {/* Room code summary if applicable */}
          {roomCode && (
            <div className="mb-6 p-3 rounded-lg inline-block">
              <p className="text-sm opacity-75">Room Code</p>
              <div className="font-mono text-xl font-bold tracking-wider">{roomCode}</div>
            </div>
          )}
          
          {/* Top 3 players podium */}
          <div className="flex justify-center items-end mb-8 h-64">
            {/* 2nd place */}
            <div className="w-1/4 px-2">
              <div className="relative">
                <div className={`w-16 h-16 mx-auto rounded-full ${
                  players[1]?.avatar === 'blue' ? 'bg-blue-500' :
                  players[1]?.avatar === 'red' ? 'bg-red-500' :
                  players[1]?.avatar === 'green' ? 'bg-green-500' :
                  players[1]?.avatar === 'purple' ? 'bg-purple-500' :
                  players[1]?.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                } text-white flex items-center justify-center text-lg font-bold mb-2`}>
                  {players[1]?.name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="font-bold">{players[1]?.name}</div>
                  <div className="text-sm opacity-75">{players[1]?.college}</div>
                  <div className="font-bold text-lg mt-1">{players[1]?.score}</div>
                </div>
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${
                  theme === 'neon' ? 'text-pink-400' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-gray-500'
                } text-4xl`}>🥈</div>
                <div className={`h-28 w-full rounded-t-lg ${
                  theme === 'neon' ? 'bg-gray-800' : 
                  theme === 'chalkboard' ? 'bg-green-700' : 
                  theme === 'space' ? 'bg-indigo-700' : 'bg-gray-200'
                } absolute -z-10 bottom-0`}></div>
              </div>
            </div>
            
            {/* 1st place */}
            <div className="w-1/3 px-2">
              <div className="relative">
                <div className={`w-20 h-20 mx-auto rounded-full ${
                  players[0]?.avatar === 'blue' ? 'bg-blue-500' :
                  players[0]?.avatar === 'red' ? 'bg-red-500' :
                  players[0]?.avatar === 'green' ? 'bg-green-500' :
                  players[0]?.avatar === 'purple' ? 'bg-purple-500' :
                  players[0]?.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                } text-white flex items-center justify-center text-2xl font-bold mb-2`}>
                  {players[0]?.name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{players[0]?.name}</div>
                  <div className="text-sm opacity-75">{players[0]?.college}</div>
                  <div className="font-bold text-xl mt-1">{players[0]?.score}</div>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">👑</div>
                <div className={`h-40 w-full rounded-t-lg ${
                  theme === 'neon' ? 'bg-pink-800' : 
                  theme === 'chalkboard' ? 'bg-yellow-600' : 
                  theme === 'space' ? 'bg-purple-600' : 'bg-blue-200'
                } absolute -z-10 bottom-0`}></div>
              </div>
            </div>
            
            {/* 3rd place */}
            <div className="w-1/4 px-2">
              <div className="relative">
                <div className={`w-16 h-16 mx-auto rounded-full ${
                  players[2]?.avatar === 'blue' ? 'bg-blue-500' :
                  players[2]?.avatar === 'red' ? 'bg-red-500' :
                  players[2]?.avatar === 'green' ? 'bg-green-500' :
                  players[2]?.avatar === 'purple' ? 'bg-purple-500' :
                  players[2]?.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                } text-white flex items-center justify-center text-lg font-bold mb-2`}>
                  {players[2]?.name.charAt(0)}
                </div>
                <div className="text-center">
                  <div className="font-bold">{players[2]?.name}</div>
                  <div className="text-sm opacity-75">{players[2]?.college}</div>
                  <div className="font-bold text-lg mt-1">{players[2]?.score}</div>
                </div>
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 ${
                  theme === 'neon' ? 'text-pink-400' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-gray-500'
                } text-4xl`}>🥉</div>
                <div className={`h-20 w-full rounded-t-lg ${
                  theme === 'neon' ? 'bg-gray-800' : 
                  theme === 'chalkboard' ? 'bg-green-700' : 
                  theme === 'space' ? 'bg-indigo-700' : 'bg-gray-200'
                } absolute -z-10 bottom-0`}></div>
              </div>
            </div>
          </div>
          
          {/* Your performance */}
          <div className={`rounded-xl p-6 ${
            theme === 'neon' ? 'bg-gray-800' : 
            theme === 'chalkboard' ? 'bg-green-700' : 
            theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
          } mb-8`}>
            <h2 className="text-xl font-bold mb-4">Your Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  theme === 'neon' ? 'text-pink-500' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  {score}
                </div>
                <div className="text-sm opacity-75">Total Score</div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  theme === 'neon' ? 'text-pink-500' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  4
                </div>
                <div className="text-sm opacity-75">Your Rank</div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  theme === 'neon' ? 'text-pink-500' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  65%
                </div>
                <div className="text-sm opacity-75">Accuracy</div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  theme === 'neon' ? 'text-pink-500' : 
                  theme === 'chalkboard' ? 'text-yellow-300' : 
                  theme === 'space' ? 'text-purple-300' : 'text-blue-600'
                }`}>
                  12s
                </div>
                <div className="text-sm opacity-75">Avg. Time</div>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                setGameState('lobby');
                setCurrentQuestion(0);
                setScore(0);
                setTimer(15);
                setPowerUps({
                  doublePoints: 1,
                  freezeTime: 1,
                  skipQuestion: 1
                });
              }}
              className={`py-3 px-6 rounded-lg font-bold transition-all ${
                theme === 'neon' ? 'bg-pink-600 hover:bg-pink-700' : 
                theme === 'chalkboard' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                theme === 'space' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              Play Again
            </button>
            
            <button 
              onClick={() => setGameState('lobby')}
              className={`py-3 px-6 rounded-lg font-bold transition-all ${
                theme === 'neon' ? 'bg-gray-800 hover:bg-gray-700' : 
                theme === 'chalkboard' ? 'bg-green-700 hover:bg-green-600' : 
                theme === 'space' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Back to Lobby
            </button>
            
            <button 
              className={`py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center ${
                theme === 'neon' ? 'bg-gray-800 hover:bg-gray-700' : 
                theme === 'chalkboard' ? 'bg-green-700 hover:bg-green-600' : 
                theme === 'space' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="mr-2">Share Results</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </div>
            </button>
          </div>
        </div>
        
        {/* Full Leaderboard */}
        <div className={`rounded-xl overflow-hidden mb-6 ${
          theme === 'neon' ? 'bg-gray-900 text-white' : 
          theme === 'chalkboard' ? 'bg-green-800 text-white' : 
          theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
        }`}>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Full Leaderboard</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className={`${
                theme === 'neon' ? 'border-b border-gray-800' : 
                theme === 'chalkboard' ? 'border-b border-green-700' : 
                theme === 'space' ? 'border-b border-indigo-700' : 'border-b'
              }`}>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player</th>
                <th className="px-6 py-3 text-left">College</th>
                <th className="px-6 py-3 text-right">Score</th>
                <th className="px-6 py-3 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr 
                  key={player.id} 
                  className={`${player.isYou ? theme === 'neon' ? 'bg-pink-900' : theme === 'chalkboard' ? 'bg-green-700' : theme === 'space' ? 'bg-purple-900' : 'bg-blue-100' : ''} 
                  ${index !== players.length - 1 ? theme === 'neon' ? 'border-b border-gray-800' : theme === 'chalkboard' ? 'border-b border-green-700' : theme === 'space' ? 'border-b border-indigo-700' : 'border-b border-gray-200' : ''}`}
                >
                  <td className="px-6 py-4">
                    {index === 0 ? <Trophy size={20} className="text-yellow-500" /> : index + 1}
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      player.avatar === 'blue' ? 'bg-blue-500' :
                      player.avatar === 'red' ? 'bg-red-500' :
                      player.avatar === 'green' ? 'bg-green-500' :
                      player.avatar === 'purple' ? 'bg-purple-500' :
                      player.avatar === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
                    } text-white`}>
                      {player.name.charAt(0)}
                    </div>
                    <span className="font-medium">{player.name}</span>
                    {player.isYou && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">YOU</span>}
                  </td>
                  <td className="px-6 py-4">{player.college}</td>
                  <td className="px-6 py-4 text-right font-bold">{player.score}</td>
                  <td className="px-6 py-4 text-right">
                    {index === 0 ? '92%' : index === 1 ? '85%' : index === 2 ? '78%' : index === 3 ? '65%' : index === 4 ? '60%' : '55%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Achievements */}
        <div className={`rounded-xl p-6 ${
          theme === 'neon' ? 'bg-gray-900 text-white' : 
          theme === 'chalkboard' ? 'bg-green-800 text-white' : 
          theme === 'space' ? 'bg-indigo-800 text-white' : 'bg-white'
        }`}>
          <h2 className="text-xl font-bold mb-4">Quiz Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg text-center ${
              theme === 'neon' ? 'bg-gray-800' : 
              theme === 'chalkboard' ? 'bg-green-700' : 
              theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
            }`}>
              <div className="text-2xl mb-2">🏎️</div>
              <div className="font-bold">Speed Demon</div>
              <div className="text-xs opacity-75">Answered 3 questions in under 5 seconds</div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              theme === 'neon' ? 'bg-gray-800' : 
              theme === 'chalkboard' ? 'bg-green-700' : 
              theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
            }`}>
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-bold">On Fire</div>
              <div className="text-xs opacity-75">3 correct answers in a row</div>
            </div>
            
            <div className={`p-4 rounded-lg text-center ${
              theme === 'neon' ? 'bg-gray-800' : 
              theme === 'chalkboard' ? 'bg-green-700' : 
              theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
            }`}>
              <div className="text-2xl mb-2">💎</div>
              <div className="font-bold">Point Collector</div>
              <div className="text-xs opacity-75">Earned over 500 points</div>
            </div>
            
            <div className={`p-4 rounded-lg text-center opacity-50 ${
              theme === 'neon' ? 'bg-gray-800' : 
              theme === 'chalkboard' ? 'bg-green-700' : 
              theme === 'space' ? 'bg-indigo-700' : 'bg-gray-100'
            }`}>
              <div className="text-2xl mb-2">🥇</div>
              <div className="font-bold">Champion</div>
              <div className="text-xs opacity-75">Win a quiz battle (Locked)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main rendering based on game state
  return (
    <div>
      {gameState === 'lobby' && renderLobby()}
      {gameState === 'countdown' && renderCountdown()}
      {gameState === 'battle' && renderBattle()}
      {gameState === 'result' && renderResult()}
    </div>
  );
};

export default MultiplayerQuizBattle;
