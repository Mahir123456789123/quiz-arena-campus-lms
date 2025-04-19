
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import ContentUploadModal from "@/components/content/ContentUploadModal";
import ContentCard from "@/components/content/ContentCard";
import ContentFilters from "@/components/content/ContentFilters";

// Define proper interfaces based on our database schema
interface ChapterMaterial {
  id: string;
  title: string;
  content?: string;
  url?: string;
  type: string;
  chapter_id: string;
  created_at: string;
  updated_at: string;
  is_assignment: boolean;
}

const ContentHub = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [materials, setMaterials] = useState<ChapterMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('chapter_materials')
        .select('*');
      
      if (selectedType) {
        query = query.eq('type', selectedType);
      }
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setMaterials(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContent();
  }, [searchQuery, selectedType]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Hub</h1>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-edu-primary hover:bg-edu-primary/80"
        >
          <Plus className="mr-2 h-4 w-4" /> Upload Content
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ContentFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p className="col-span-full text-center py-8">Loading content...</p>
          ) : materials.length === 0 ? (
            <p className="col-span-full text-center py-8">No content found. Try a different search or upload some content!</p>
          ) : (
            materials.map((material) => (
              <ContentCard 
                key={material.id}
                id={material.id}
                title={material.title}
                type={material.type}
                url={material.url}
                createdAt={new Date(material.created_at)}
              />
            ))
          )}
        </div>
      </div>
      
      <ContentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchContent}
      />
    </div>
  );
};

export default ContentHub;
