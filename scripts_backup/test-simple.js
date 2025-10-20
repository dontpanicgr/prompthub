// Simple test to verify the migration worked
// This tests the actual function that was failing

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Read .env.local file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
    
    return envVars
  } catch (error) {
    console.error('Error reading .env.local:', error.message)
    return {}
  }
}

const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProjectIdColumn() {
  console.log('🧪 Testing if project_id column exists and works...\n')

  try {
    // Test 1: Try to query prompts with project_id (this will fail if column doesn't exist)
    console.log('1️⃣ Testing basic query with project_id...')
    const { data: prompts, error: queryError } = await supabase
      .from('prompts')
      .select('id, title, project_id')
      .limit(3)

    if (queryError) {
      if (queryError.message.includes('project_id') && queryError.message.includes('does not exist')) {
        console.log('❌ project_id column does not exist in prompts table')
        console.log('   Error:', queryError.message)
        return false
      } else {
        console.error('❌ Other error querying prompts:', queryError)
        return false
      }
    }

    console.log('✅ Successfully queried prompts with project_id column!')
    console.log(`   Found ${prompts.length} prompts`)
    
    // Show sample data
    prompts.forEach((prompt, index) => {
      console.log(`   ${index + 1}. ${prompt.title} (project_id: ${prompt.project_id || 'null'})`)
    })

    // Test 2: Try to filter by project_id
    console.log('\n2️⃣ Testing project_id filtering...')
    const { data: filteredPrompts, error: filterError } = await supabase
      .from('prompts')
      .select('id, title, project_id')
      .not('project_id', 'is', null)
      .limit(3)

    if (filterError) {
      console.error('❌ Error filtering by project_id:', filterError)
      return false
    }

    console.log(`✅ Successfully filtered prompts by project_id!`)
    console.log(`   Found ${filteredPrompts.length} prompts with project assignments`)

    // Test 3: Try the specific query that was failing
    console.log('\n3️⃣ Testing the exact query from getPromptsByProject...')
    const testProjectId = 'fb5c8680-c0c0-4ee3-a5e8-b555eeedc424' // From your error
    const { data: projectPrompts, error: projectError } = await supabase
      .from('prompts')
      .select('id')
      .eq('project_id', testProjectId)
      .limit(1)

    if (projectError) {
      console.error('❌ Error with project_id query:', projectError)
      return false
    }

    console.log(`✅ Successfully queried prompts by project_id!`)
    console.log(`   Found ${projectPrompts.length} prompts for project ${testProjectId}`)

    console.log('\n🎉 All tests passed! The migration was successful!')
    console.log('✅ The project_id column is working correctly!')
    return true

  } catch (error) {
    console.error('❌ Test failed with exception:', error)
    return false
  }
}

testProjectIdColumn().then(success => {
  if (success) {
    console.log('\n✅ You can now refresh your browser and the project page should work!')
  } else {
    console.log('\n❌ The migration may not have been applied correctly.')
    console.log('   Please check the Supabase dashboard and run the migration again.')
  }
})
