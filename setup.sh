#!/bin/bash

# PromptHub Setup Script
# This script helps you set up the required environment variables

echo "PromptHub Environment Setup"
echo "==========================="
echo ""

echo "This application requires Supabase environment variables to work."
echo "You need to:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Get your project URL and anon key from the Supabase dashboard"
echo "3. Run the database schema from supabase-schema.sql in your Supabase SQL editor"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo ".env.local already exists!"
    echo "Please edit it with your Supabase credentials."
else
    echo "Creating .env.local file..."
    
    cp .env.example .env.local
    echo ".env.local created successfully!"
    echo "Please edit .env.local with your actual Supabase credentials."
fi

echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase URL and anon key"
echo "2. Run the SQL schema in your Supabase project"
echo "3. Restart the development server with 'npm run dev'"
echo ""
echo "For more help, check the README.md file."
