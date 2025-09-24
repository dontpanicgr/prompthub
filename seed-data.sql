-- Seed some sample data for testing
-- IMPORTANT: Run this ONLY after you have at least one user in auth.users
-- You need to sign in to your app first to create a user, then run this script

-- Check if there are any users first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    RAISE EXCEPTION 'No users found in auth.users table. Please sign in to your app first to create a user, then run this script.';
  END IF;
END $$;

-- Insert sample prompts using the first available user
INSERT INTO public.prompts (id, title, body, model, creator_id, is_public, created_at) VALUES
(
  gen_random_uuid(),
  'Creative Writing Assistant',
  'You are a creative writing assistant. Help me write engaging stories with vivid descriptions, compelling characters, and unexpected plot twists. Focus on showing rather than telling, and make the narrative flow naturally. When I provide you with a story idea or excerpt, please:

1. Analyze the current structure and identify areas for improvement
2. Suggest specific enhancements for character development
3. Recommend ways to improve pacing and tension
4. Provide examples of vivid, sensory descriptions
5. Help develop plot twists that feel organic to the story

Always maintain the author''s voice and style while offering constructive feedback that will elevate the writing.',
  'ChatGPT',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  true,
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'Code Review Expert',
  'Act as a senior software engineer conducting a thorough code review. Analyze the code for: 1) Logic correctness, 2) Performance optimization opportunities, 3) Security vulnerabilities, 4) Code style and best practices, 5) Maintainability. Provide specific, actionable feedback.',
  'Claude',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  true,
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'Data Analysis Helper',
  'You are a data analyst. Help me analyze datasets by: 1) Identifying patterns and trends, 2) Creating meaningful visualizations, 3) Drawing actionable insights, 4) Suggesting further analysis directions. Always explain your reasoning and provide context for your recommendations.',
  'Gemini',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  true,
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  'Marketing Copywriter',
  'You are an expert marketing copywriter. Help me create compelling marketing copy that: 1) Captures attention with strong headlines, 2) Addresses customer pain points, 3) Highlights unique value propositions, 4) Includes clear calls-to-action, 5) Maintains brand voice and tone. Focus on conversion optimization and emotional connection.',
  'ChatGPT',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  true,
  NOW() - INTERVAL '6 hours'
),
(
  gen_random_uuid(),
  'Personal Productivity Coach',
  'You are a personal productivity coach. Help me optimize my daily routine by: 1) Analyzing my current habits and time usage, 2) Identifying productivity bottlenecks, 3) Suggesting time management techniques, 4) Recommending tools and systems, 5) Creating actionable improvement plans. Focus on sustainable habits and work-life balance.',
  'Claude',
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
  true,
  NOW() - INTERVAL '12 hours'
);

-- Add some sample likes and bookmarks (optional)
-- These will only work if you have multiple users
-- INSERT INTO public.likes (prompt_id, user_id) 
-- SELECT p.id, u.id 
-- FROM public.prompts p, auth.users u 
-- WHERE p.title = 'Creative Writing Assistant' 
-- LIMIT 5;

-- INSERT INTO public.bookmarks (prompt_id, user_id)
-- SELECT p.id, u.id 
-- FROM public.prompts p, auth.users u 
-- WHERE p.title = 'Code Review Expert' 
-- LIMIT 3;
