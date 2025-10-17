// Test script to verify the project_id column migration
// Run this with: node scripts/test-migration.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testMigration() {
  console.log('🧪 Testing project_id column migration...\n')

  try {
    // Test 1: Check if project_id column exists
    console.log('1️⃣ Checking if project_id column exists...')
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'prompts')
      .eq('table_schema', 'public')

    if (columnError) {
      console.error('❌ Error checking columns:', columnError)
      return
    }

    const hasProjectId = columns.some(col => col.column_name === 'project_id')
    console.log(hasProjectId ? '✅ project_id column exists' : '❌ project_id column missing')
    
    if (hasProjectId) {
      const projectIdColumn = columns.find(col => col.column_name === 'project_id')
      console.log(`   Type: ${projectIdColumn.data_type}`)
      console.log(`   Nullable: ${projectIdColumn.is_nullable}`)
    }

    // Test 2: Try to query prompts with project_id
    console.log('\n2️⃣ Testing query with project_id...')
    const { data: prompts, error: queryError } = await supabase
      .from('prompts')
      .select('id, title, project_id')
      .limit(5)

    if (queryError) {
      console.error('❌ Error querying prompts:', queryError)
      return
    }

    console.log(`✅ Successfully queried ${prompts.length} prompts`)
    console.log('Sample prompts:')
    prompts.forEach((prompt, index) => {
      console.log(`   ${index + 1}. ${prompt.title} (project_id: ${prompt.project_id || 'null'})`)
    })

    // Test 3: Test the getPromptsByProject function
    console.log('\n3️⃣ Testing getPromptsByProject function...')
    
    // First, get a project ID to test with
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(1)

    if (projectsError) {
      console.error('❌ Error getting projects:', projectsError)
      return
    }

    if (projects.length > 0) {
      const testProjectId = projects[0].id
      console.log(`   Testing with project: ${projects[0].name} (${testProjectId})`)
      
      // Import and test the function
      const { getPromptsByProject } = require('../src/lib/database')
      const projectPrompts = await getPromptsByProject(testProjectId)
      
      console.log(`✅ getPromptsByProject returned ${projectPrompts.length} prompts`)
    } else {
      console.log('⚠️  No projects found to test with')
    }

    console.log('\n🎉 Migration test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testMigration()
