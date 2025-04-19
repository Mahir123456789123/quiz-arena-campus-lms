
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CoursesPreview from "@/components/home/CoursesPreview";
import QuizBattlesPreview from "@/components/home/QuizBattlesPreview";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CoursesPreview />
        <QuizBattlesPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
