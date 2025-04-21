import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import { QuizCard } from '@/components/quiz/QuizCard';

const QuizBattles = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isStudent = profile?.role === 'student';

  const AVAILABLE_QUIZZES = [
    { 
      id: 'operating-systems', 
      title: 'Operating Systems', 
      description: 'Test your knowledge of OS concepts including processes, memory management, and file systems.', 
      difficulty: 'Medium' as const, 
      participants: 24, 
      points: 250 
    },
    { 
      id: 'algorithms', 
      title: 'Algorithms', 
      description: 'Challenge yourself with algorithmic problem solving and complexity analysis questions.', 
      difficulty: 'Hard' as const, 
      participants: 18, 
      points: 500 
    },
    { 
      id: 'computer-networks', 
      title: 'Computer Networks', 
      description: 'Questions covering network protocols, architecture, and communication fundamentals.', 
      difficulty: 'Medium' as const, 
      participants: 32, 
      points: 300 
    },
    { 
      id: 'data-structures', 
      title: 'Data Structures', 
      description: 'Test your understanding of fundamental data structures and their implementations.', 
      difficulty: 'Medium' as const, 
      participants: 28, 
      points: 350 
    },
    { 
      id: 'python-programming', 
      title: 'Python Programming', 
      description: 'Python language concepts, syntax, and common programming patterns.', 
      difficulty: 'Easy' as const, 
      participants: 42, 
      points: 200 
    },
    { 
      id: 'database-management', 
      title: 'Database Management', 
      description: 'Database concepts, SQL queries, normalization, and transaction management.', 
      difficulty: 'Medium' as const, 
      participants: 22, 
      points: 300 
    },
  ];

  const startQuiz = (quizId: string) => {
    if (!isStudent) {
      toast.error('Only students can take quizzes');
      return;
    }
    navigate(`/quiz-battle/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Quiz Battles
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
            Test your knowledge against others and climb the leaderboard to earn rewards!
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_QUIZZES.map((quiz) => (
            <QuizCard
              key={quiz.id}
              title={quiz.title}
              description={quiz.description}
              difficulty={quiz.difficulty}
              participants={quiz.participants}
              points={quiz.points}
              onJoin={() => startQuiz(quiz.id)}
              disabled={!isStudent}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizBattles;