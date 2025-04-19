import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import SettingsPage from "./pages/settings/SettingsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/auth/AuthPage";
import CourseManagement from "./pages/instructor/CourseManagement";
import CourseView from "./pages/student/CourseView";
import CourseBrowser from "./pages/student/CourseBrowser";
import CourseQuizzes from "./pages/instructor/CourseQuizzes";
import QuizBattles from "./pages/quiz/QuizBattles";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><CourseBrowser /></ProtectedRoute>} />
              <Route path="/courses/:courseId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
              <Route path="/courses/:courseId/manage" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
              <Route path="/courses/:courseId/quizzes" element={<ProtectedRoute><CourseQuizzes /></ProtectedRoute>} />
              <Route path="/quizzes" element={<ProtectedRoute><QuizBattles /></ProtectedRoute>} />
              <Route path="/quiz-battles" element={<QuizBattles />} />
              <Route path="/quiz-battle/:roomId" element={<QuizBattlePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
