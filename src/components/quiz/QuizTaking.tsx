
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import QuizSocket from './QuizSocket';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

const quizData: Record<string, Question[]> = {
  general: [
    {
      question: "What's the Paris capital of?",
      options: ["London", "Berlin", "Rome", "Paris"],
      answer: "4"
    },
    {
      question: "What's 2+2?",
      options: ["3", "4", "5", "6"],
      answer: "2"
    }
  ],
  science: [
    {
      question: "Water is?",
      options: ["H2O", "CO2", "O2", "NH3"],
      answer: "1"
    },
    {
      question: "Earth's radius in km?",
      options: ["6000km", "6371km", "8000km", "5000km"],
      answer: "2"
    }
  ],
  history: [
    {
      question: "Who wrote Tom Sawyer?",
      options: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
      answer: "4"
    }
  ],
  geography: [
    {
      question: "What's the longest river?",
      options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
      answer: "2"
    }
  ],
  arts: [
    {
      question: "Who painted the Mona Lisa?",
      options: ["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"],
      answer: "1"
    }
  ]
};

const QuizTaking: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  const questions = quizData[roomId] || [];

  useEffect(() => {
    if (profile?.role === 'instructor') {
      toast.error('Instructors cannot take quizzes');
      navigate('/quiz-battles');
    }
  }, [profile, navigate]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const goToNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    if (selectedAnswer + 1 === parseInt(questions[currentQuestionIndex].answer)) {
      setScore(prevScore => prevScore + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (profile?.role === 'instructor') {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{roomId.charAt(0).toUpperCase() + roomId.slice(1)} Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          {isFinished ? (
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold mb-6">Quiz Complete!</h2>
              <p className="text-lg mb-8">Your Score: {score} / {questions.length}</p>
              
              <QuizSocket roomId={roomId} onScoreUpdate={(newScore) => setScore(newScore)} />
              
              <Button 
                onClick={() => navigate('/quiz-battles')} 
                variant="outline" 
                className="mt-6"
              >
                Back to Quiz Battles
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {questions[currentQuestionIndex].question}
                </h3>
                <ul className="space-y-2">
                  {questions[currentQuestionIndex].options.map((option, index) => (
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
              </div>

              <Button onClick={goToNextQuestion} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaking;
