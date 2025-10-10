-- Performance optimization indexes for better query performance
-- Run these in your Supabase SQL editor

-- Index for prompts table queries
CREATE INDEX IF NOT EXISTS idx_prompts_public_created_at 
ON prompts (is_public, created_at DESC) 
WHERE is_public = true;

-- Index for likes table queries
CREATE INDEX IF NOT EXISTS idx_likes_prompt_id 
ON likes (prompt_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_id 
ON likes (user_id);

-- Index for bookmarks table queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_prompt_id 
ON bookmarks (prompt_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id 
ON bookmarks (user_id);

-- Index for profiles table queries
CREATE INDEX IF NOT EXISTS idx_profiles_private 
ON profiles (is_private);

-- Index for prompt_categories table
CREATE INDEX IF NOT EXISTS idx_prompt_categories_prompt_id 
ON prompt_categories (prompt_id);

CREATE INDEX IF NOT EXISTS idx_prompt_categories_category_id 
ON prompt_categories (category_id);

-- Index for categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug 
ON categories (slug);

-- Composite index for efficient prompt queries with creator info
CREATE INDEX IF NOT EXISTS idx_prompts_creator_public_created 
ON prompts (creator_id, is_public, created_at DESC) 
WHERE is_public = true;

-- Index for comments table
CREATE INDEX IF NOT EXISTS idx_comments_prompt_id_created 
ON comments (prompt_id, created_at DESC) 
WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_comments_user_id 
ON comments (user_id);

-- Index for search functionality
CREATE INDEX IF NOT EXISTS idx_prompts_title_search 
ON prompts USING gin (to_tsvector('english', title)) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_prompts_body_search 
ON prompts USING gin (to_tsvector('english', body)) 
WHERE is_public = true;

-- Index for model filtering
CREATE INDEX IF NOT EXISTS idx_prompts_model_public 
ON prompts (model, is_public, created_at DESC) 
WHERE is_public = true;
