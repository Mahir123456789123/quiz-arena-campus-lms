import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileIcon, Eye, Star, Download, PlayCircle, FileText, Presentation, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Content } from '@/types/content';
import { toast } from 'sonner';
import TextToSpeech from "@/components/ui/text-to-speech";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ContentCard = ({ content }: { content: Content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Theme configuration based on content type with solid colors from the image
  const themeConfig = {
    video: {
      primary: 'bg-[#6BBAA7]',
      border: 'border-[#6BBAA7]',
      accent: 'bg-[#6BBAA7]',
      accentHover: 'hover:bg-[#5CA996]',
      icon: 'bg-white text-[#6BBAA7]',
      badge: 'bg-white text-[#6BBAA7] border-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-[#6BBAA7]',
      footerBg: 'bg-[#6BBAA7]',
      textColor: 'text-white',
      secondaryTextColor: 'text-white/80',
    },
    article: {
      primary: 'bg-[#FBA100]',
      border: 'border-[#FBA100]',
      accent: 'bg-[#FBA100]',
      accentHover: 'hover:bg-[#E59300]',
      icon: 'bg-white text-[#FBA100]',
      badge: 'bg-white text-[#FBA100] border-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-[#FBA100]',
      footerBg: 'bg-[#FBA100]',
      textColor: 'text-white',
      secondaryTextColor: 'text-white/80',
    },
    ppt: {
      primary: 'bg-[#6C64BB]',
      border: 'border-[#6C64BB]',
      accent: 'bg-[#6C64BB]',
      accentHover: 'hover:bg-[#5D56A6]',
      icon: 'bg-white text-[#6C64BB]',
      badge: 'bg-white text-[#6C64BB] border-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-[#6C64BB]',
      footerBg: 'bg-[#6C64BB]',
      textColor: 'text-white',
      secondaryTextColor: 'text-white/80',
    },
    default: {
      primary: 'bg-gray-600',
      border: 'border-gray-600',
      accent: 'bg-gray-600',
      accentHover: 'hover:bg-gray-700',
      icon: 'bg-white text-gray-600',
      badge: 'bg-white text-gray-600 border-white',
      buttonBg: 'bg-white hover:bg-gray-100',
      buttonText: 'text-gray-600',
      footerBg: 'bg-gray-600',
      textColor: 'text-white',
      secondaryTextColor: 'text-white/80',
    }
  };
  
  // Get theme based on content type
  const theme = themeConfig[content.type as keyof typeof themeConfig] || themeConfig.default;
  
  const getIcon = () => {
    switch(content.type) {
      case 'video':
        return <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.icon}`}><PlayCircle className="w-6 h-6" /></div>;
      case 'article':
        return <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.icon}`}><FileText className="w-6 h-6" /></div>;
      case 'ppt':
        return <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.icon}`}><Presentation className="w-6 h-6" /></div>;
      default:
        return <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.icon}`}><FileIcon className="w-6 h-6" /></div>;
    }
  };

  const handleDownload = async () => {
    try {
      if (!content.file_path) {
        toast.error('No file available for download');
        return;
      }
      
      const { data, error } = await supabase.storage
        .from('content')
        .download(content.file_path);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = content.title; // Use content title as filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      const { error: updateError } = await supabase
        .from('content')
        .update({ downloads: (content.downloads || 0) + 1 })
        .eq('id', content.id);

      if (updateError) throw updateError;

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const getActionButton = () => {
    switch (content.type) {
      case 'video':
        return (
          <Link
            to={`/content/${content.id}`}
            className={`inline-flex items-center px-4 py-2 ${theme.buttonBg} ${theme.buttonText} rounded-md transition-all duration-200 font-medium`}
          >
            <PlayCircle className="h-4 w-4 mr-2" /> Watch Video
          </Link>
        );
      case 'article':
        return (
          <Link
            to={`/content/${content.id}`}
            className={`inline-flex items-center px-4 py-2 ${theme.buttonBg} ${theme.buttonText} rounded-md transition-all duration-200 font-medium`}
          >
            <FileText className="h-4 w-4 mr-2" /> Read Article
          </Link>
        );
      case 'ppt':
        return (
          <Button 
            className={`${theme.buttonBg} ${theme.buttonText} rounded-md font-medium`}
            onClick={handleDownload}
          >
            <Presentation className="h-4 w-4 mr-2" /> Download Presentation
          </Button>
        );
      default:
        return content.file_path ? (
          <Button 
            className={`${theme.buttonBg} ${theme.buttonText} rounded-md font-medium`}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" /> Download File
          </Button>
        ) : null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className={`overflow-hidden transition-all duration-300 ${theme.primary} border ${theme.border} shadow-md rounded-lg`}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-4">
              {getIcon()}
              <div>
                <CardTitle className={`text-lg font-semibold mb-1 ${theme.textColor}`}>{content.title}</CardTitle>
                <div className={`flex items-center text-sm ${theme.secondaryTextColor} gap-2`}>
                  <span className="font-medium">{content.author_name}</span>
                  <span className={theme.secondaryTextColor}>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(content.date), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${theme.badge} px-3 py-1 rounded-md font-medium uppercase text-xs tracking-wide`}>
              {content.type}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="text-sm mb-3">
            <Badge variant="outline" className={`mr-2 ${theme.badge} rounded-md px-3 py-0.5`}>
              {content.subject}
            </Badge>
          </div>
          
          {content.article_snippet && (
            <div className="mt-2">
              <div className="flex items-start justify-between gap-3">
                <p className={`text-sm ${theme.textColor} ${!isExpanded && 'line-clamp-2'} leading-relaxed`}>
                  {content.article_snippet}
                </p>
                <TextToSpeech text={content.article_snippet} />
              </div>
              {content.article_snippet.length > 120 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`mt-2 h-6 px-2 text-xs text-white bg-white/20 hover:bg-white/30`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className={`border-t border-white/10 pt-3 pb-4 flex flex-col gap-3 ${theme.footerBg}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-5 text-sm text-white">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {content.views || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-300" /> {content.rating || 0}
              </span>
              {content.downloads !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> {content.downloads}
                </span>
              )}
            </div>
          </div>
          
          <div className="w-full flex justify-end">
            {getActionButton()}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ContentCard;