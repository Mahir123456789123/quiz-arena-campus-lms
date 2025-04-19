
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StudentCourseView from '@/components/course/StudentCourseView';

const CourseView = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <StudentCourseView />
      </main>
      <Footer />
    </div>
  );
};

export default CourseView;
