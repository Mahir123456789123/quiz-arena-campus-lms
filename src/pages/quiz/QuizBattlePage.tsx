
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import QuizTaking from '@/components/quiz/QuizTaking';

const QuizBattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <QuizTaking />
      </main>
      <Footer />
    </div>
  );
};

export default QuizBattlePage;
