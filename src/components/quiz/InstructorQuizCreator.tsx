
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Quiz, QuizQuestion } from '@/types/quiz';

const InstructorQuizCreator = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(15);
  const [difficulty, setDifficulty] = useState<Quiz['difficulty']>('medium');
  const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    // Update order positions
    const updatedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order_position: i
    }));
    setQuestions(updatedQuestions);
  };

  const handleUpdateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      question_text: text
    };
    setQuestions(newQuestions);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, text: string) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options!];
    options[optionIndex] = text;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options
    };
    setQuestions(newQuestions);
  };

  const handleUpdateCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      correct_answer: optionIndex
    };
    setQuestions(newQuestions);
  };

  const handleUpdateExplanation = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      explanation: text
    };
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options!];
    options.push('');
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options
    };
    setQuestions(newQuestions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options!];
    options.splice(optionIndex, 1);
    
    // If removing the correct answer or an option before it, adjust correct_answer
    let correctAnswer = newQuestions[questionIndex].correct_answer!;
    if (optionIndex === correctAnswer) {
      correctAnswer = 0; // Default to first option if removing the correct one
    } else if (optionIndex < correctAnswer) {
      correctAnswer--; // Decrement if removing an option before the correct one
    }
    
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options,
      correct_answer: correctAnswer
    };
    setQuestions(newQuestions);
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return false;
    }
    
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text?.trim()) {
        toast.error(`Question ${i + 1} needs text`);
        return false;
      }
      
      if (!questions[i].options || questions[i].options.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return false;
      }
      
      for (let j = 0; j < questions[i].options!.length; j++) {
        if (!questions[i].options![j].trim()) {
          toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleCreateQuiz = async () => {
    if (!validateQuiz()) return;
    
    try {
      setIsSubmitting(true);

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
          is_published: true // Set to true so students can see it
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
      
      // Navigate back to course management
      if (courseId) {
        navigate(`/courses/${courseId}/manage`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Quiz Title</label>
              <Input
                placeholder="Quiz Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                placeholder="Quiz Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Time Limit (minutes)</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  placeholder="Time Limit (minutes)"
                  value={timeLimit}
                  onChange={e => setTimeLimit(parseInt(e.target.value) || 15)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={difficulty}
                  onValueChange={value => setDifficulty(value as Quiz['difficulty'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <Button onClick={handleAddQuestion} size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Add Question
          </Button>
        </div>
        
        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="relative">
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2" 
              onClick={() => handleRemoveQuestion(qIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  placeholder="Enter your question"
                  value={question.question_text || ''}
                  onChange={e => handleUpdateQuestionText(qIndex, e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Options</label>
                {question.options?.map((option, oIndex) => (
                  <div key={oIndex} className="flex gap-2">
                    <Input
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={question.correct_answer === oIndex ? "default" : "outline"}
                      onClick={() => handleUpdateCorrectAnswer(qIndex, oIndex)}
                    >
                      Correct
                    </Button>
                    {question.options!.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddOption(qIndex)}
                  className="mt-2"
                >
                  Add Option
                </Button>
              </div>
              
              <div>
                <label className="text-sm font-medium">Explanation (Optional)</label>
                <Textarea
                  placeholder="Explanation for the correct answer"
                  value={question.explanation || ''}
                  onChange={e => handleUpdateExplanation(qIndex, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        
        {questions.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">No questions added yet.</p>
            <Button onClick={handleAddQuestion} variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Question
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleCreateQuiz} 
          disabled={isSubmitting || questions.length === 0}
          size="lg"
        >
          {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default InstructorQuizCreator;
