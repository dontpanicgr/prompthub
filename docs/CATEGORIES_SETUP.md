# Categories Setup Instructions

## Overview
I've successfully added categories dropdown functionality to both the Create and Edit prompt pages. Here's what was implemented:

## Database Schema
You'll need to run the following SQL in your Supabase SQL Editor to create the categories tables:

```sql
-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompt_categories junction table
CREATE TABLE IF NOT EXISTS public.prompt_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prompt_id, category_id)
);

-- Enable RLS on categories tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Prompt categories are viewable by everyone" ON public.prompt_categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert prompt categories for their own prompts" ON public.prompt_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE id = prompt_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prompt categories for their own prompts" ON public.prompt_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE id = prompt_id AND creator_id = auth.uid()
    )
  );

-- Insert default categories
INSERT INTO public.categories (slug, name, description, icon, color, sort_order) VALUES
('education', 'Education', 'Learning, teaching, and educational content', 'BookOpen', '#3B82F6', 1),
('writing', 'Writing', 'Creative writing, content creation, and text generation', 'PenTool', '#10B981', 2),
('research', 'Research', 'Data analysis, investigation, and research tasks', 'Search', '#8B5CF6', 3),
('code', 'Code', 'Programming, development, and technical assistance', 'Code', '#F59E0B', 4),
('how-to', 'How-to', 'Tutorials, guides, and step-by-step instructions', 'HelpCircle', '#EF4444', 5),
('work', 'Work', 'Professional tasks, productivity, and business', 'Briefcase', '#6366F1', 6),
('business', 'Business', 'Business strategy, planning, and management', 'Building2', '#14B8A6', 7),
('personal', 'Personal', 'Personal development, lifestyle, and self-improvement', 'User', '#F97316', 8),
('health', 'Health', 'Health, wellness, and medical topics', 'Heart', '#EC4899', 9),
('entertainment', 'Entertainment', 'Games, fun activities, and entertainment', 'Gamepad2', '#84CC16', 10),
('multimedia', 'Multimedia', 'Images, videos, and creative media', 'Image', '#06B6D4', 11),
('news', 'News', 'Current events, news, and information', 'Newspaper', '#6B7280', 12),
('other', 'Other', 'Miscellaneous and uncategorized content', 'Lightbulb', '#9CA3AF', 13)
ON CONFLICT (slug) DO NOTHING;
```

## What Was Implemented

### 1. Database Functions Updated
- **`createPrompt`**: Now accepts `category_ids` parameter and creates prompt-category relationships
- **`updatePrompt`**: Now accepts `category_ids` parameter and updates prompt-category relationships
- **`getCategories`**: Already existed, fetches all available categories

### 2. New Components Created
- **`CategoriesDropdown`**: A reusable dropdown component for selecting multiple categories
  - Shows selected categories as badges with remove functionality
  - Displays all available categories with icons
  - Supports multi-selection
  - Handles loading states and errors gracefully

### 3. Forms Updated
- **Create Prompt Form**: Added categories dropdown after model selection
- **Edit Prompt Form**: Added categories dropdown after model selection
  - Pre-populates with existing categories when editing
  - Updates categories when saving changes

### 4. Features
- **Multi-selection**: Users can select multiple categories for a single prompt
- **Visual feedback**: Selected categories are displayed as removable badges
- **Icons**: Each category has a corresponding icon for better visual identification
- **Optional**: Categories are optional - users can create prompts without selecting any
- **Responsive**: Works well on both desktop and mobile devices

## Usage
1. Run the SQL schema in your Supabase database
2. The categories dropdown will automatically appear on both Create and Edit prompt pages
3. Users can select multiple categories by clicking on them
4. Selected categories appear as badges that can be removed by clicking the X
5. Categories are saved when the prompt is created or updated

## Testing
To test the functionality:
1. Go to the Create Prompt page
2. Fill out the form and select some categories
3. Save the prompt
4. Go to Edit the prompt and verify categories are loaded
5. Modify categories and save to test updates

The implementation is complete and ready to use!
