
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InstructorQuizCreator from '@/components/quiz/InstructorQuizCreator';

const CourseQuizzes = () => {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Course Quizzes</h1>
          <InstructorQuizCreator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseQuizzes;
