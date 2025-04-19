import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Save, X, Check, ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useParams } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const InstructorQuizCreator = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('15');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: crypto.randomUUID(),
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('course_id', courseId)
          .eq('created_by', user?.id);
          
        if (error) throw error;
        setQuizzes(data || []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId && user?.id) {
      fetchQuizzes();
    }
  }, [courseId, user?.id]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOrUpdateQuestion = () => {
    // Validate question
    if (!currentQuestion.question.trim()) {
      toast.error('Question text is required');
      return;
    }
    
    // Validate options
    if (currentQuestion.options.some(option => !option.trim())) {
      toast.error('All options must be filled');
      return;
    }
    
    // Check for duplicate options
    const uniqueOptions = new Set(currentQuestion.options);
    if (uniqueOptions.size !== currentQuestion.options.length) {
      toast.error('All options must be unique');
      return;
    }

    if (editingIndex !== null) {
      // Update existing question
      const newQuestions = [...questions];
      newQuestions[editingIndex] = currentQuestion;
      setQuestions(newQuestions);
      setEditingIndex(null);
      toast.success('Question updated successfully');
    } else {
      // Add new question
      setQuestions([...questions, currentQuestion]);
      toast.success('Question added successfully');
    }

    // Reset current question
    setCurrentQuestion({
      id: crypto.randomUUID(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentQuestion({
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      });
    }
    toast.success('Question deleted');
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === questions.length - 1)) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
    
    // Update editing index if we're moving the question being edited
    if (editingIndex === index) {
      setEditingIndex(targetIndex);
    } else if (editingIndex === targetIndex) {
      setEditingIndex(index);
    }
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setCurrentQuestion({
      id: crypto.randomUUID(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  const createQuiz = async () => {
    // Validate quiz details
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    
    if (questions.length < 1) {
      toast.error('At least one question is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          description: quizDescription,
          time_limit: parseInt(timeLimit),
          difficulty,
          course_id: courseId,
          created_by: user?.id,
          question_count: questions.length,
          is_published: true
        })
        .select()
        .single();

      if (quizError) throw quizError;
      
      // Add questions
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        order_position: index + 1
      }));
      
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsToInsert);
        
      if (questionsError) throw questionsError;
      
      toast.success('Quiz created successfully');
      
      // Reset form
      setQuizTitle('');
      setQuizDescription('');
      setTimeLimit('15');
      setDifficulty('medium');
      setQuestions([]);
      setCurrentQuestion({
        id: crypto.randomUUID(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      });
      
      // Refresh quizzes list
      const { data: refreshedQuizzes } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .eq('created_by', user?.id);
        
      setQuizzes(refreshedQuizzes || []);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      // Delete questions first (due to foreign key constraint)
      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);
        
      if (questionsError) throw questionsError;
      
      // Then delete the quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
        
      if (quizError) throw quizError;
      
      toast.success('Quiz deleted successfully');
      
      // Update the quizzes list
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz Creation Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quiz Title</label>
                  <Input 
                    value={quizTitle} 
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea 
                    value={quizDescription} 
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Enter quiz description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Time Limit (seconds per question)</label>
                    <Input 
                      type="number" 
                      value={timeLimit} 
                      onChange={(e) => setTimeLimit(e.target.value)}
                      min="5"
                      max="120"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Difficulty</label>
                    <Select 
                      value={difficulty} 
                      onValueChange={setDifficulty}
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
                
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {editingIndex !== null ? `Edit Question #${editingIndex + 1}` : 'Add New Question'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Question</label>
                      <Textarea 
                        value={currentQuestion.question} 
                        onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        placeholder="Enter your question"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Options</label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                currentQuestion.correctAnswer === index 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                            </div>
                            <Input 
                              value={option} 
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              className="flex-1"
                            />
                            <Button 
                              type="button" 
                              variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                            >
                              {currentQuestion.correctAnswer === index ? <Check size={16} /> : 'Correct'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                      <Textarea 
                        value={currentQuestion.explanation} 
                        onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                        placeholder="Explain why the correct answer is right"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      {editingIndex !== null && (
                        <Button type="button" variant="outline" onClick={cancelEditing}>
                          <X size={16} className="mr-2" /> Cancel
                        </Button>
                      )}
                      <Button type="button" onClick={addOrUpdateQuestion}>
                        {editingIndex !== null 
                          ? <><Save size={16} className="mr-2" /> Update Question</> 
                          : <><Plus size={16} className="mr-2" /> Add Question</>
                        }
                      </Button>
                    </div>
                  </div>
                </div>
                
                {questions.length > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Questions ({questions.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <Card key={q.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">Question {index + 1}</div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                                  <ArrowUp size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                                  <ArrowDown size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => editQuestion(index)}>
                                  <Edit size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteQuestion(index)}>
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                            <p className="mb-2">{q.question}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              {q.options.map((option, i) => (
                                <div 
                                  key={i} 
                                  className={`p-2 rounded-md text-sm ${
                                    q.correctAnswer === i
                                      ? 'bg-green-100 border border-green-300'
                                      : 'bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  <span className="inline-block w-5">{String.fromCharCode(65 + i)}.</span> {option}
                                  {q.correctAnswer === i && (
                                    <span className="text-green-700 text-xs ml-2">(Correct)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <div className="text-sm text-gray-600 italic">
                                <span className="font-medium">Explanation:</span> {q.explanation}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Button onClick={createQuiz} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Creating Quiz...' : 'Save Quiz'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Existing Quizzes List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="py-8 text-center border rounded-md">
                  <p className="text-gray-500">No quizzes created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <Button variant="ghost" size="sm" onClick={() => deleteQuiz(quiz.id)}>
                          <Trash size={16} />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{quiz.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {quiz.question_count} questions
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {quiz.time_limit} seconds
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          quiz.difficulty === 'hard' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorQuizCreator;
