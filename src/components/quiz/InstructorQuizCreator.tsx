import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Quiz, QuizQuestion } from '@/types/quiz';

const InstructorQuizCreator = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [difficulty, setDifficulty] = useState<Quiz['difficulty']>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        order_position: questions.length
      }
    ]);
  };

  const handleCreateQuiz = async () => {
    try {
      // Validate inputs
      if (questions.length === 0) {
        toast.error('Please add at least one question');
        return;
      }

      // First create the quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          time_limit: timeLimit,
          difficulty,
          course_id: courseId,
          created_by: user?.id,
          question_count: questions.length,
          is_published: false
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Prepare questions with quiz_id
      const questionsWithQuizId = questions.map(q => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        order_position: q.order_position
      }));

      // Then create all questions
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId);

      if (questionsError) throw questionsError;

      toast.success('Quiz created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setTimeLimit(15);
      setDifficulty('medium');
      setQuestions([]);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Quiz Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Quiz Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Time Limit (seconds)"
            value={timeLimit}
            onChange={e => setTimeLimit(parseInt(e.target.value))}
          />
          <select
            className="form-select"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as Quiz['difficulty'])}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Questions</h3>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border p-4 rounded-lg space-y-4">
            <Input
              placeholder="Question"
              value={question.question_text}
              onChange={e => {
                const newQuestions = [...questions];
                newQuestions[qIndex] = {
                  ...question,
                  question_text: e.target.value
                };
                setQuestions(newQuestions);
              }}
            />
            
            {question.options?.map((option, oIndex) => (
              <div key={oIndex} className="flex gap-2">
                <Input
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={e => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex] = {
                      ...question,
                      options: question.options?.map((opt, i) =>
                        i === oIndex ? e.target.value : opt
                      )
                    };
                    setQuestions(newQuestions);
                  }}
                />
                <Button
                  variant={question.correct_answer === oIndex ? 'default' : 'outline'}
                  onClick={() => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex] = {
                      ...question,
                      correct_answer: oIndex
                    };
                    setQuestions(newQuestions);
                  }}
                >
                  Correct
                </Button>
              </div>
            ))}
            
            <Textarea
              placeholder="Explanation (optional)"
              value={question.explanation}
              onChange={e => {
                const newQuestions = [...questions];
                newQuestions[qIndex] = {
                  ...question,
                  explanation: e.target.value
                };
                setQuestions(newQuestions);
              }}
            />
          </div>
        ))}
        <Button onClick={handleAddQuestion}>Add Question</Button>
      </div>

      <Button onClick={handleCreateQuiz} className="w-full">
        Create Quiz
      </Button>
    </div>
  );
};

export default InstructorQuizCreator;
