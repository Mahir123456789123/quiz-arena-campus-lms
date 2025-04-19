
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import ContentUploadModal from '@/components/content/ContentUploadModal';
import ContentCard from '@/components/content/ContentCard';
import { toast } from 'sonner';

// Mock data for content as we're waiting for the database migration
const mockContent = [
  {
    id: '1',
    title: 'Introduction to React',
    type: 'video',
    subject: 'Web Development',
    author_name: 'John Doe',
    date: new Date().toISOString(),
    views: 125,
    rating: 4,
    file_path: null
  },
  {
    id: '2',
    title: 'Database Design',
    type: 'ppt',
    subject: 'Computer Science',
    author_name: 'Jane Smith',
    date: new Date().toISOString(),
    views: 85,
    rating: 5,
    file_path: null
  },
  {
    id: '3',
    title: 'Machine Learning Fundamentals',
    type: 'article',
    subject: 'Artificial Intelligence',
    author_name: 'Alan Turing',
    article_snippet: 'Machine learning is a branch of artificial intelligence (AI) and computer science which focuses on the use of data and algorithms to imitate the way that humans learn, gradually improving its accuracy.',
    date: new Date().toISOString(),
    views: 210,
    rating: 4,
    file_path: null
  }
];

const ContentHub = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user, profile } = useAuth();
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';
  const [content] = useState(mockContent);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    toast.success('Content uploaded successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Community Content Hub</h1>
            <p className="text-muted-foreground">Explore resources shared by instructors</p>
          </div>
          
          {isInstructor && (
            <Button onClick={() => setShowUploadModal(true)}>
              Upload Content
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item: any) => (
            <ContentCard key={item.id} content={item} />
          ))}
          
          {content.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No content has been shared yet.</p>
              {isInstructor && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4"
                >
                  Be the first to share
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
      {showUploadModal && (
        <ContentUploadModal 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={handleUploadSuccess} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ContentHub;
