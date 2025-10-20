# PowerShell script to run database migration
# This script helps you run the migration to add project_id column

Write-Host "Database Migration Script" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Check if Supabase CLI is available
try {
    $supabaseVersion = supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Supabase CLI found: $supabaseVersion" -ForegroundColor Green
        
        # Check if we're in a Supabase project
        if (Test-Path "supabase/config.toml") {
            Write-Host "Supabase project detected. Running migration..." -ForegroundColor Yellow
            
            # Run the migration
            supabase db push
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Migration completed successfully!" -ForegroundColor Green
            } else {
                Write-Host "Migration failed. Please check the error messages above." -ForegroundColor Red
            }
        } else {
            Write-Host "No Supabase project found. Please run this from your project root." -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Supabase CLI not found. Please use the manual method below." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "MANUAL MIGRATION STEPS:" -ForegroundColor Cyan
    Write-Host "1. Go to your Supabase dashboard" -ForegroundColor White
    Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
    Write-Host "3. Copy and paste the contents of 'scripts/fix-project-id-column.sql'" -ForegroundColor White
    Write-Host "4. Click 'Run' to execute the migration" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install Supabase CLI:" -ForegroundColor Cyan
    Write-Host "npm install -g supabase" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
