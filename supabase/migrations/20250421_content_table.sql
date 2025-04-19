
-- Create content table
CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'article', 'ppt')),
  subject TEXT NOT NULL,
  article_snippet TEXT,
  file_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for content table
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to create content
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

-- Create storage bucket for content
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to read content
CREATE POLICY "Authenticated users can view content files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'content');

-- Create policy to allow instructors to upload content files
CREATE POLICY "Instructors can upload content files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  )
);

-- Create policy to allow users to delete their own content files
CREATE POLICY "Users can delete their own content files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
