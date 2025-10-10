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

