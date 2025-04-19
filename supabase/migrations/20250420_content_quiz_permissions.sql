
-- Enable RLS on content table
ALTER TABLE IF EXISTS public.content ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to insert content
CREATE POLICY "Instructors can create content"
ON public.content
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to update their own content
CREATE POLICY "Instructors can update their own content"
ON public.content
FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to delete their own content
CREATE POLICY "Instructors can delete their own content"
ON public.content
FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for anyone to view content
CREATE POLICY "Anyone can view content"
ON public.content
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on quizzes table
ALTER TABLE IF EXISTS public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to create quizzes
CREATE POLICY "Instructors can create quizzes"
ON public.quizzes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to update their own quizzes
CREATE POLICY "Instructors can update their own quizzes"
ON public.quizzes
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to delete their own quizzes
CREATE POLICY "Instructors can delete their own quizzes"
ON public.quizzes
FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for everyone to view published quizzes
CREATE POLICY "Anyone can view published quizzes"
ON public.quizzes
FOR SELECT
TO authenticated
USING (
  is_published = true OR 
  created_by = auth.uid()
);

-- Enable RLS on quiz_rooms table
ALTER TABLE IF EXISTS public.quiz_rooms ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to create quiz rooms
CREATE POLICY "Instructors can create quiz rooms"
ON public.quiz_rooms
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to update their own quiz rooms
CREATE POLICY "Instructors can update their own quiz rooms"
ON public.quiz_rooms
FOR UPDATE
TO authenticated
USING (
  host_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for everyone to view quiz rooms
CREATE POLICY "Anyone can view quiz rooms"
ON public.quiz_rooms
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on quiz_participants table
ALTER TABLE IF EXISTS public.quiz_participants ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to join quizzes
CREATE POLICY "Authenticated users can join quizzes"
ON public.quiz_participants
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create policy for users to update their own participation
CREATE POLICY "Users can update their own participation"
ON public.quiz_participants
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create policy for users to view quiz participants
CREATE POLICY "Anyone can view quiz participants"
ON public.quiz_participants
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on quiz_questions table
ALTER TABLE IF EXISTS public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to insert quiz questions
CREATE POLICY "Instructors can insert quiz questions"
ON public.quiz_questions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to update their own quiz questions
CREATE POLICY "Instructors can update their own quiz questions"
ON public.quiz_questions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE id = quiz_id AND created_by = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for instructors to delete their own quiz questions
CREATE POLICY "Instructors can delete their own quiz questions"
ON public.quiz_questions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE id = quiz_id AND created_by = auth.uid()
  ) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy for anyone to view quiz questions
-- Note: This allows viewing questions, but the application logic should control when to show them
CREATE POLICY "Anyone can view quiz questions"
ON public.quiz_questions
FOR SELECT
TO authenticated
USING (true);

-- Add an increment function for score updates
CREATE OR REPLACE FUNCTION public.increment(row_id uuid, inc integer)
RETURNS void AS $$
BEGIN
  UPDATE public.quiz_participants
  SET score = score + inc
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
