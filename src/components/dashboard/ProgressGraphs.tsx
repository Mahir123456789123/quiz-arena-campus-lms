
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const ProgressGraphs = () => {
  const { data: studyData, isLoading } = useQuery({
    queryKey: ['study-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;

      // Transform the data for the charts
      return data.map(session => ({
        ...session,
        date: format(new Date(session.date), 'MMM dd'),
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-card to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-gradient-to-br from-card to-background">
        <CardHeader>
          <CardTitle>Study Time Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                <YAxis className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  name="Study Minutes"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorProgress)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card to-background">
        <CardHeader>
          <CardTitle>Completed Modules Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                <YAxis className="text-muted-foreground text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="completedmodules"
                  name="Completed Modules"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressGraphs;
