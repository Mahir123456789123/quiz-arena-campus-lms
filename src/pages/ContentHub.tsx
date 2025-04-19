
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Eye, 
  Clock, 
  BookOpen, 
  FileText, 
  Video, 
  Filter 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

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
  views: number;
  rating: number;
}

const ContentHub: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [showModal, setShowModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('is_published', true);

        if (contentError) throw contentError;

        if (contentData) {
          setContent(contentData);
          // Extract unique subjects
          const subjects = Array.from(new Set(contentData.map(item => item.subject)));
          setUniqueSubjects(subjects);
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
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'ppt':
        return <FileText className="h-4 w-4 mr-2" />;
      case 'video':
        return <Video className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-600 text-white border-blue-700';
      case 'ppt':
        return 'bg-amber-600 text-white border-amber-700';
      case 'article':
        return 'bg-emerald-600 text-white border-emerald-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlaceholderPreview = (type: string) => {
    switch (type) {
      case 'article':
        return 'https://via.placeholder.com/400x225/059669/ffffff?text=Article+Preview';
      case 'ppt':
        return 'https://via.placeholder.com/400x225/d97706/ffffff?text=Slides+Preview';
      case 'video':
        return 'https://via.placeholder.com/400x225/1e40af/ffffff?text=Video+Preview';
      default:
        return 'https://via.placeholder.com/400x225/9E9E9E/FFFFFF?text=Content+Preview';
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

  const handleSuccessfulUpload = () => {
    setShowModal(false);
    // Refresh content after upload
    window.location.reload();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`star ${i < fullStars ? 'text-yellow-400' : i === fullStars && hasHalfStar ? 'text-yellow-400 opacity-60' : 'text-gray-300'}`}>
            ★
          </span>
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const filteredContent = content
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
    .sort((a, b) => {
      switch (filter) {
        case "mostViewed":
          return b.views - a.views;
        case "highlyRated":
          return b.rating - a.rating;
        case "latest":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const contentTypes = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Videos" },
    { value: "ppt", label: "Slides" },
    { value: "article", label: "Articles" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Content Hub
            </span>
          </h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 w-full"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearch("")}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          </div>
          
          <Button
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all"
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4" /> Upload Content
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 rounded-lg shadow border border-border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 ml-auto">
            {subjectFilter !== "all" && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {subjectFilter}
                <button 
                  className="ml-1" 
                  onClick={() => setSubjectFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="outline" className="bg-secondary/10 text-secondary">
                {contentTypes.find(t => t.value === typeFilter)?.label}
                <button 
                  className="ml-1" 
                  onClick={() => setTypeFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {showModal && (
          <ContentUploadModal onClose={handleCloseModal} onSuccess={handleSuccessfulUpload} />
        )}

        <Tabs defaultValue="latest" onValueChange={(val) => setFilter(val)}>
          <TabsList>
            <TabsTrigger 
              value="latest" 
              className="flex items-center gap-1"
            >
              <Clock className="h-4 w-4" /> Latest
            </TabsTrigger>
            <TabsTrigger 
              value="mostViewed" 
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" /> Most Viewed
            </TabsTrigger>
            <TabsTrigger 
              value="highlyRated" 
              className="flex items-center gap-1"
            >
              <Star className="h-4 w-4" /> Highly Rated
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading content...</div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg shadow">
                <div className="text-muted-foreground mb-2">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-bold">No content found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <Card key={item.id} className="overflow-hidden h-full flex flex-col bg-card border-border hover:shadow-md transition-all duration-300">
                    <div className="relative">
                      <img
                        src={getPlaceholderPreview(item.type)}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black bg-opacity-60 p-3 border-2 border-white">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          className={`${getContentTypeColor(item.type)} px-3 py-1.5 font-semibold border-b-2`}
                        >
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(item.type)}
                            {item.type === 'ppt' ? 'Slides' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </div>
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2 border-b border-border">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="font-medium bg-secondary/10 text-secondary-foreground">
                          {item.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-3 flex-grow">
                      <p className="text-sm font-medium mb-2">By {item.author_name}</p>
                      {item.type === "article" && item.article_snippet && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          "{item.article_snippet}"
                        </p>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t border-border pt-3 bg-muted/30">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 text-muted-foreground mr-1" />
                          <span className="text-sm font-medium">{item.views.toLocaleString()} views</span>
                        </div>
                        <div>
                          {renderStars(item.rating)}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentHub;
