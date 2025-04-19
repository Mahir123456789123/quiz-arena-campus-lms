
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, UserCircle, Trash2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useCourseDiscussions } from '@/hooks/useCourseDiscussions';
import { useAuth } from '@/lib/auth';

interface DiscussionsTabProps {
  courseId: string;
}

const DiscussionsTab = ({ courseId }: DiscussionsTabProps) => {
  const [message, setMessage] = useState('');
  const { 
    discussions, 
    isLoading, 
    createDiscussion, 
    deleteDiscussion,
    likeDiscussion,
    dislikeDiscussion 
  } = useCourseDiscussions(courseId);
  const { user } = useAuth();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    createDiscussion(message);
    setMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Discussions</CardTitle>
        <CardDescription>Engage with instructors and fellow students through course discussion board</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-md p-4 space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : discussions?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No discussions yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start the conversation by posting a message.
                </p>
              </div>
            ) : (
              discussions?.map((discussion) => (
                <div key={discussion.id} className="flex gap-3 relative group">
                  <div className="flex-shrink-0">
                    {discussion.profiles?.avatar_url ? (
                      <img 
                        src={discussion.profiles.avatar_url} 
                        alt={discussion.profiles.full_name || ''}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{discussion.profiles?.full_name || 'Anonymous'}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(discussion.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{discussion.content}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => likeDiscussion(discussion.id)}
                      >
                        <ThumbsUp className={`h-4 w-4 ${discussion.likes?.includes(user?.id) ? 'text-primary fill-primary' : ''}`} />
                        <span className="text-xs">{discussion.likes?.length || 0}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => dislikeDiscussion(discussion.id)}
                      >
                        <ThumbsDown className={`h-4 w-4 ${discussion.dislikes?.includes(user?.id) ? 'text-destructive fill-destructive' : ''}`} />
                        <span className="text-xs">{discussion.dislikes?.length || 0}</span>
                      </Button>
                    </div>
                  </div>
                  {user?.id === discussion.user_id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteDiscussion(discussion.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim()}>
              <Send className="h-4 w-4 mr-1" /> Post
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionsTab;
