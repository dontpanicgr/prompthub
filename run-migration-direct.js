const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://gafaoyoldiowmcpopeun.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZmFveW9sZGlvd21jcG9wZXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ0MzY2MiwiZXhwIjoyMDc0MDE5NjYyfQ.-32tPFaNBbub8cbzT5siSQ7cMV2DglrMjXzJTilYuWM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting migration to add project_id column to prompts table...');
    
    // Check if project_id column already exists
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'prompts')
      .eq('column_name', 'project_id')
      .eq('table_schema', 'public');

    if (columnError) {
      console.error('Error checking columns:', columnError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('project_id column already exists in prompts table.');
      return;
    }

    // Run the migration SQL
    const migrationSQL = `
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
    `;

    const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (migrationError) {
      console.error('Migration error:', migrationError);
      return;
    }

    console.log('Migration completed successfully!');
    
    // Verify the column was added
    const { data: verifyColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'prompts')
      .eq('column_name', 'project_id')
      .eq('table_schema', 'public');

    if (verifyError) {
      console.error('Error verifying migration:', verifyError);
      return;
    }

    if (verifyColumns && verifyColumns.length > 0) {
      console.log('✅ Migration verified: project_id column now exists in prompts table.');
    } else {
      console.log('❌ Migration verification failed: project_id column not found.');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runMigration();
