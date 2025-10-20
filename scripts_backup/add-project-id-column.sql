-- Script to add project_id column to prompts table
-- Run this in your Supabase SQL editor if the migration doesn't work

-- Check if column exists first
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'prompts' 
AND column_name = 'project_id' 
AND table_schema = 'public';

-- Add project_id column if it doesn't exist
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS prompts_project_id_idx ON public.prompts(project_id);

-- Add comment
COMMENT ON COLUMN public.prompts.project_id IS 'Reference to the project this prompt belongs to';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'prompts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
