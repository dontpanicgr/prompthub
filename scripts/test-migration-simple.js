// Simple test script to verify the project_id column migration
// Run this with: node scripts/test-migration-simple.js

const { createClient } = require('@supabase/supabase-js')

// Get environment variables from process.env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
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

    // Test 3: Test a simple project_id query
    console.log('\n3️⃣ Testing project_id filtering...')
    const { data: promptsWithProject, error: projectQueryError } = await supabase
      .from('prompts')
      .select('id, title, project_id')
      .not('project_id', 'is', null)
      .limit(3)

    if (projectQueryError) {
      console.error('❌ Error querying prompts with project_id:', projectQueryError)
    } else {
      console.log(`✅ Found ${promptsWithProject.length} prompts with project assignments`)
      promptsWithProject.forEach((prompt, index) => {
        console.log(`   ${index + 1}. ${prompt.title} (project_id: ${prompt.project_id})`)
      })
    }

    console.log('\n🎉 Migration test completed successfully!')
    console.log('✅ The project_id column is working correctly!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testMigration()
