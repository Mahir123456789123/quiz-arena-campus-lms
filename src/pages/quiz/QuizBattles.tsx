
import React from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Hardcoded quiz categories from new CSV
const AVAILABLE_QUIZZES = [
  { id: 'operating-systems', title: 'Operating Systems', description: 'Test your knowledge of OS concepts' },
  { id: 'algorithms', title: 'Algorithms', description: 'Algorithmic problem solving and complexity' },
  { id: 'computer-networks', title: 'Computer Networks', description: 'Network protocols and architecture' },
  { id: 'data-structures', title: 'Data Structures', description: 'Fundamental data structures' },
  { id: 'python-programming', title: 'Python Programming', description: 'Python language and concepts' },
  { id: 'database-management', title: 'Database Management', description: 'Database concepts and SQL' },
  { id: 'discrete-mathematics', title: 'Discrete Mathematics', description: 'Mathematical foundations of CS' },
  { id: 'computer-organization', title: 'Computer Organization', description: 'Computer architecture and organization' },
  { id: 'software-engineering', title: 'Software Engineering', description: 'Software development methodologies' },
  { id: 'theory-of-computation', title: 'Theory of Computation', description: 'Computational theory and automata' }
];

const QuizBattles = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isStudent = profile?.role === 'student';

  const startQuiz = (quizId: string) => {
    if (!isStudent) {
      toast.error('Only students can take quizzes');
      return;
    }
    navigate(`/quiz-battle/${quizId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Available Quizzes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_QUIZZES.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {quiz.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{quiz.description}</p>
              <Button 
                onClick={() => startQuiz(quiz.id)} 
                className="w-full"
                disabled={!isStudent}
              >
                Start Quiz
              </Button>
              {!isStudent && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Only students can take quizzes
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizBattles;
