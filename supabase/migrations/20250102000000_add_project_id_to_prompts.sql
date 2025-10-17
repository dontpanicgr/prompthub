-- Migration: Add project_id column to prompts table
-- File: supabase/migrations/20250102000000_add_project_id_to_prompts.sql

-- Add project_id column to prompts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'prompts' 
        AND column_name = 'project_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.prompts 
        ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS prompts_project_id_idx ON public.prompts(project_id);
        
        -- Add comment
        COMMENT ON COLUMN public.prompts.project_id IS 'Reference to the project this prompt belongs to';
    END IF;
END $$;
