
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import ContentUploadModal from '@/components/content/ContentUploadModal';
import ContentCard from '@/components/content/ContentCard';

const ContentHub = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { profile } = useAuth();
  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin';

  const { data: content = [], refetch } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    refetch();
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
