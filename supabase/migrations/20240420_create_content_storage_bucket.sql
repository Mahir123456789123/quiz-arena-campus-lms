
-- Create a storage bucket for content files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'Content Files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view content" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'content');

CREATE POLICY "Instructors can upload content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'instructor'
  )
);

CREATE POLICY "Content owners can update their content"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content' AND
  EXISTS (
    SELECT 1 FROM public.content
    WHERE file_path = SUBSTRING(name FROM 1) AND author_id = auth.uid()
  )
);

CREATE POLICY "Content owners can delete their content"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content' AND
  EXISTS (
    SELECT 1 FROM public.content
    WHERE file_path = SUBSTRING(name FROM 1) AND author_id = auth.uid()
  )
);
