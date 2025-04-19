
import { useAuth } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, FileQuestion, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Instructor View</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">2 published this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground mt-1">+25 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quiz Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">652</div>
              <p className="text-xs text-muted-foreground mt-1">87% completion rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Course Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Create, edit and manage your courses.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/instructor/courses">My Courses</Link>
                </Button>
                <Button asChild>
                  <Link to="/instructor/courses/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Course
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" />
                <span>Quiz Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Create and manage quizzes for your courses.</p>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/instructor/quizzes">My Quizzes</Link>
                </Button>
                <Button asChild>
                  <Link to="/instructor/quizzes/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstructorDashboard;
