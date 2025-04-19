
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CourseHeaderProps {
  course: {
    title: string;
    code: string;
  } | null;
}

const CourseHeader = ({ course }: CourseHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{course?.title}</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
      <p className="text-muted-foreground mt-2">Course Code: {course?.code}</p>
    </div>
  );
};

export default CourseHeader;
