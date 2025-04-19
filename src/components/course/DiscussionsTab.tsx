
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, UserCircle, Trash2, Send } from 'lucide-react';

interface DiscussionsTabProps {
  comments: any[];
  userId: string;
  onCreateComment: (content: string) => void;
  onDeleteComment: (id: string) => void;
}

const DiscussionsTab = ({ comments, userId, onCreateComment, onDeleteComment }: DiscussionsTabProps) => {
  const [comment, setComment] = useState('');

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    onCreateComment(comment);
    setComment('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Discussions</CardTitle>
        <CardDescription>Engage with students through course discussion board</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border rounded-md p-4 space-y-4 max-h-96 overflow-y-auto">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No discussions yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start the conversation by posting a comment.
                </p>
              </div>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3 relative group">
                  <div className="flex-shrink-0">
                    {comment.profiles?.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt={comment.profiles.full_name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{comment.profiles?.full_name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                  {userId === comment.user_id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleSendComment} className="flex gap-2">
            <Input 
              placeholder="Type your message..." 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!comment.trim()}>
              <Send className="h-4 w-4 mr-1" /> Post
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionsTab;
