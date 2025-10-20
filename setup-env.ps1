# Setup Environment Variables for PromptHub
# This script will help you set up the required Supabase environment variables

Write-Host "PromptHub Environment Setup" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

Write-Host "This application requires Supabase environment variables to work." -ForegroundColor Yellow
Write-Host "You need to:" -ForegroundColor Yellow
Write-Host "1. Create a Supabase project at https://supabase.com" -ForegroundColor White
Write-Host "2. Get your project URL and anon key from the Supabase dashboard" -ForegroundColor White
Write-Host "3. Run the database schema from supabase-schema.sql in your Supabase SQL editor" -ForegroundColor White
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host ".env.local already exists!" -ForegroundColor Green
    Write-Host "Please edit it with your Supabase credentials." -ForegroundColor Yellow
} else {
    Write-Host "Creating .env.local file..." -ForegroundColor Blue
    
    $envContent = @"
# Supabase Configuration
# Replace these with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server-side (optional)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Managed AI Provider Keys (optional)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
GOOGLE_AI_STUDIO_API_KEY=your-google-ai-studio-key
GROQ_API_KEY=gsk_your-groq-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-jwt

# BYOK encryption key
BYOK_ENC_KEY=your-32-character-encryption-key-here

# OpenAI-compatible base URL overrides
OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# GROQ_BASE_URL=https://api.groq.com/openai/v1
# GOOGLE_AI_STUDIO_BASE_URL=https://generativelanguage.googleapis.com/v1beta

# Example:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host ".env.local created successfully!" -ForegroundColor Green
    Write-Host "Please edit .env.local with your actual Supabase credentials." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your Supabase URL and anon key" -ForegroundColor White
Write-Host "2. Run the SQL schema in your Supabase project" -ForegroundColor White
Write-Host "3. Restart the development server with 'npm run dev'" -ForegroundColor White
Write-Host ""
Write-Host "For more help, check the README.md file." -ForegroundColor Gray

