
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import QuizTaking from '@/components/quiz/QuizTaking';

const QuizBattlePage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return <div>Error: No room ID provided</div>;
  }

  console.log("QuizBattlePage received roomId:", roomId);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <QuizTaking roomId={roomId} />
      </main>
      <Footer />
    </div>
  );
};

export default QuizBattlePage;
