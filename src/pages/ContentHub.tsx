import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Upload, BookOpenCheck, Presentation, FileVideo2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ContentUploadModal from '@/components/content/ContentUploadModal';

interface ContentItem {
  id: string;
  title: string;
  author_id: string;
  author_name: string;
  type: string;
  subject: string;
  article_snippet: string | null;
  file_path: string | null;
  date: string;
  is_published: boolean;
}

const ContentHub: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [showModal, setShowModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('is_published', true)
          .order('date', { ascending: false });

        if (contentError) throw contentError;

        if (contentData) {
          setContent(contentData);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(data?.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchContent();
    fetchUserRole();
  }, [user]);

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpenCheck className="h-4 w-4 mr-2" />;
      case 'ppt':
        return <Presentation className="h-4 w-4 mr-2" />;
      case 'video':
        return <FileVideo2 className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'bg-green-100 text-green-800';
      case 'ppt':
        return 'bg-red-100 text-red-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlaceholderPreview = (type: string) => {
    switch (type) {
      case 'article':
        return 'https://via.placeholder.com/640x360/4CAF50/FFFFFF?text=Article+Preview';
      case 'ppt':
        return 'https://via.placeholder.com/640x360/F44336/FFFFFF?text=Presentation+Preview';
      case 'video':
        return 'https://via.placeholder.com/640x360/2196F3/FFFFFF?text=Video+Preview';
      default:
        return 'https://via.placeholder.com/640x360/9E9E9E/FFFFFF?text=Content+Preview';
    }
  };

  const handleUploadClick = () => {
    if (userRole !== 'instructor') {
      toast.error('Only instructors can upload content');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < rating ? 'active' : ''}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-800">
              Content Hub
            </span>
          </h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearch("")}
              className="whitespace-nowrap border-gray-300 hover:bg-gray-200"
            >
              Clear
            </Button>
          </div>
          
          {userRole === 'instructor' && (
            <Button
              variant="default"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all border border-blue-800"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4" /> Upload Content
            </Button>
          )}
        </div>

        <div className="flex items-center justify-start gap-4 overflow-x-auto">
          <select
            className="form-select"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="history">History</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="ppt">Presentation</option>
          </select>

          <select
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="popular">Popular</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center">Loading content...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content
              .filter((item) => {
                const searchTerm = search.toLowerCase();
                return (
                  item.title.toLowerCase().includes(searchTerm) ||
                  item.author_name.toLowerCase().includes(searchTerm) ||
                  item.subject.toLowerCase().includes(searchTerm)
                );
              })
              .filter((item) => {
                return subjectFilter === 'all' ? true : item.subject === subjectFilter;
              })
              .filter((item) => {
                return typeFilter === 'all' ? true : item.type === typeFilter;
              })
              .map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={getPlaceholderPreview(item.type)}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                    <p className="text-sm text-gray-500 mb-2">By {item.author_name}</p>
                    <div className="flex items-center mb-2">
                      {getContentTypeIcon(item.type)}
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getContentTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.article_snippet}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        {renderStars(4)}
                        <span className="text-gray-500 text-sm ml-1">(4.5)</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showModal && (
        <ContentUploadModal onClose={handleCloseModal} onSuccess={handleCloseModal} />
      )}
    </div>
  );
};

export default ContentHub;
