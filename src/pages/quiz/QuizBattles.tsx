
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MultiplayerQuizBattle from '@/components/quiz/MultiplayerQuizBattle';

const QuizBattles = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <MultiplayerQuizBattle />
      </main>
      <Footer />
    </div>
  );
};

export default QuizBattles;
