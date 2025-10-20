const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting migration to add project_id column to prompts table...');
    
    // First, let's try to create the projects table if it doesn't exist
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS public.projects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3B82F6',
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', { sql: createProjectsTable });
    
    if (projectsError) {
      console.log('Projects table might already exist or error:', projectsError.message);
    } else {
      console.log('✅ Projects table created/verified');
    }

    // Now add the project_id column to prompts table
    const addProjectIdColumn = `
      ALTER TABLE public.prompts 
      ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
    `;

    console.log('Adding project_id column to prompts table...');
    const { error: columnError } = await supabase.rpc('exec_sql', { sql: addProjectIdColumn });
    
    if (columnError) {
      console.log('Column might already exist or error:', columnError.message);
    } else {
      console.log('✅ project_id column added to prompts table');
    }

    // Create index for performance
    const createIndex = `
      CREATE INDEX IF NOT EXISTS prompts_project_id_idx ON public.prompts(project_id);
    `;

    console.log('Creating index...');
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndex });
    
    if (indexError) {
      console.log('Index might already exist or error:', indexError.message);
    } else {
      console.log('✅ Index created');
    }

    console.log('Migration completed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runMigration();
