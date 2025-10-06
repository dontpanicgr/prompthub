-- Fix RLS policies for comments table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Create new policies that work with API routes
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (is_deleted = false);

-- Allow insert if user_id matches the authenticated user OR if we're using service role
CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Allow update if user_id matches the authenticated user OR if we're using service role
CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );

-- Allow delete if user_id matches the authenticated user OR if we're using service role
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  );
