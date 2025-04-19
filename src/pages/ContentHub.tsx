
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Search, 
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
import { motion } from "framer-motion";
import { ContentItem } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import ContentUploadModal from "@/components/content/ContentUploadModal";
import { toast } from "sonner";

// Sample content for initial loading state
const sampleContent: ContentItem[] = [
  {
    id: "1",
    title: "Loading content...",
    author_id: "",
    author_name: "Loading...",
    type: "article",
    views: 0,
    rating: 0,
    subject: "Loading...",
    date: new Date().toISOString(),
    is_published: true
  }
];

const ContentHub: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("latest");
  const [showModal, setShowModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [contentItems, setContentItems] = useState<ContentItem[]>(sampleContent);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const isInstructor = profile?.role === 'instructor';

  const contentTypes = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Videos" },
    { value: "ppt", label: "Slides" },
    { value: "article", label: "Articles" }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('is_published', true);

      if (error) throw error;
      
      if (data) {
        setContentItems(data as ContentItem[]);
        
        // Extract unique subjects
        const subjects = Array.from(new Set(data.map(item => item.subject)));
        setUniqueSubjects(subjects);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "ppt":
        return <FileText className="w-5 h-5" />;
      case "article":
        return <BookOpen className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-blue-600 text-white border-blue-700 dark:bg-blue-700 dark:border-blue-800";
      case "ppt":
        return "bg-amber-600 text-white border-amber-700 dark:bg-amber-700 dark:border-amber-800";
      case "article":
        return "bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-700 dark:border-emerald-800";
      default:
        return "";
    }
  };

  const getPlaceholderPreview = (type: string) => {
    const placeholderUrls = {
      video: "https://via.placeholder.com/400x225/1e40af/ffffff?text=Video+Preview",
      ppt: "https://via.placeholder.com/400x225/d97706/ffffff?text=Slides+Preview",
      article: "https://via.placeholder.com/400x225/059669/ffffff?text=Article+Preview"
    };
  
    return (
      <div className="w-full h-48 relative">
        <img
          src={placeholderUrls[type as keyof typeof placeholderUrls]}
          alt={`${type} placeholder`}
          className="w-full h-full object-cover"
        />
        {type === "video" && (
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
            className={`${getContentTypeColor(type)} px-3 py-1.5 font-semibold border-b-2`}
          >
            <div className="flex items-center gap-2">
              {getContentTypeIcon(type)}
              {type === 'ppt' ? 'Slides' : type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          </Badge>
        </div>
      </div>
    );
  };

  const filteredContent = [...contentItems]
    .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => subjectFilter === "all" || item.subject === subjectFilter)
    .filter((item) => typeFilter === "all" || item.type === typeFilter)
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

  const handleUploadClick = () => {
    if (!user) {
      toast.error('Please log in to upload content');
      return;
    }
    
    if (!isInstructor) {
      toast.error('Only instructors can upload content');
      return;
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleContentUploadSuccess = () => {
    setShowModal(false);
    fetchContent();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="text-yellow-400">
            {i < fullStars ? (
              <Star className="w-4 h-4 fill-current" />
            ) : i === fullStars && hasHalfStar ? (
              <Star className="w-4 h-4 fill-current opacity-60" />
            ) : (
              <Star className="w-4 h-4" />
            )}
          </div>
        ))}
        <span className="ml-1 text-sm text-gray-800 dark:text-gray-200 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-800 dark:from-blue-500 dark:to-purple-500">
              Content Hub
            </span>
          </h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSearch("")}
              className="whitespace-nowrap border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>
          
          <Button
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all border border-blue-800 dark:from-blue-600 dark:to-purple-600 dark:border-blue-700"
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4" /> Upload Content
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-700 dark:text-blue-500" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40 border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent className="border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent className="border border-gray-300 shadow-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applied filters badges */}
          <div className="flex flex-wrap gap-2 ml-auto">
            {subjectFilter !== "all" && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-medium dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800">
                {subjectFilter}
                <button 
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100" 
                  onClick={() => setSubjectFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-medium dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800">
                {contentTypes.find(t => t.value === typeFilter)?.label}
                <button 
                  className="ml-1 hover:text-purple-900 dark:hover:text-purple-100" 
                  onClick={() => setTypeFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Modal for Upload Content */}
        {showModal && (
          <ContentUploadModal 
            onClose={handleCloseModal} 
            onSuccess={handleContentUploadSuccess}
          />
        )}

        <Tabs defaultValue="latest" onValueChange={(val) => setFilter(val)}>
          <TabsList className="bg-white dark:bg-gray-800 shadow-sm border border-gray-300 dark:border-gray-700">
            <TabsTrigger 
              value="latest" 
              className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
            >
              <Clock className="h-4 w-4" /> Latest
            </TabsTrigger>
            <TabsTrigger 
              value="mostViewed" 
              className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
            >
              <Eye className="h-4 w-4" /> Most Viewed
            </TabsTrigger>
            <TabsTrigger 
              value="highlyRated" 
              className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
            >
              <Star className="h-4 w-4" /> Highly Rated
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading content...</p>
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-300 dark:border-gray-700">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">No content found</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <motion.div
                    key={item.id}
                    className="h-full"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => navigate(`/resources/${item.id}`)}
                  >
                    <Card className="overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow hover:shadow-md transition-all duration-300">
                      {item.preview_url ? (
                        <div className="relative">
                          <img
                            src={item.preview_url}
                            alt={`${item.title} preview`}
                            className="w-full h-48 object-cover border-b border-gray-300 dark:border-gray-700"
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
                      ) : (
                        getPlaceholderPreview(item.type)
                      )}
                      
                      <CardHeader className="pb-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                            {item.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="font-medium bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                            {item.subject}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-3 flex-grow">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">By {item.author_name}</p>
                        {item.type === "article" && item.article_snippet && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            "{item.article_snippet}"
                          </p>
                        )}
                      </CardContent>
                      
                      <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-3 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.views.toLocaleString()} views</span>
                          </div>
                          <div>
                            {renderStars(item.rating)}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
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
