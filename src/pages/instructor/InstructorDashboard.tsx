import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserCourses } from "@/hooks/useUserCourses";
import { useScheduledMeetings } from "@/hooks/useScheduledMeetings";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { CreateMeetingButton } from "@/components/video/CreateMeetingButton";
import { StatsCards } from "@/components/dashboard/instructor/StatsCards";
import { UpcomingMeetings } from "@/components/dashboard/instructor/UpcomingMeetings";
import { CreateCourseForm } from "@/components/dashboard/instructor/CreateCourseForm";
import { CourseList } from "@/components/dashboard/instructor/CourseList";
import { useNavigate } from "react-router-dom";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: courses = [], refetch: refetchCourses } = useUserCourses();
  const { meetings: upcomingMeetings, isLoading: isLoadingMeetings } =
    useScheduledMeetings();

  // Filter upcoming meetings (today or future)
  const isUpcomingMeeting = (meeting: any) => {
    const meetingDate = new Date(meeting.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetingDate >= today;
  };

  const filteredMeetings = upcomingMeetings.filter(isUpcomingMeeting);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your courses and content
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(true)}>
              Create Course
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/instructor/course-quizzes")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Manage Quizzes
            </Button>
            <CreateMeetingButton />
          </div>
        </div>

        <StatsCards coursesCount={courses.length} />

        <UpcomingMeetings
          meetings={filteredMeetings}
          isLoading={isLoadingMeetings}
        />

        {showCreateForm && (
          <CreateCourseForm
            userId={user?.id || ""}
            onSuccess={() => {
              setShowCreateForm(false);
              refetchCourses();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <CourseList courses={courses} onDelete={refetchCourses} />
      </main>
      <Footer />
    </div>
  );
};

export default InstructorDashboard;
