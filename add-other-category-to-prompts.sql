-- Add "Other" category to prompts that don't have any categories
-- This query will assign the "Other" category to all prompts that currently have no categories

-- First, let's check how many prompts don't have categories
SELECT 
  COUNT(*) as prompts_without_categories
FROM public.prompts p
LEFT JOIN public.prompt_categories pc ON p.id = pc.prompt_id
WHERE pc.prompt_id IS NULL;

-- Now add the "Other" category to all prompts without categories
INSERT INTO public.prompt_categories (prompt_id, category_id)
SELECT 
  p.id as prompt_id,
  c.id as category_id
FROM public.prompts p
CROSS JOIN public.categories c
WHERE c.slug = 'other'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.prompt_categories pc 
    WHERE pc.prompt_id = p.id
  );

-- Verify the results
SELECT 
  COUNT(*) as prompts_now_with_other_category
FROM public.prompt_categories pc
JOIN public.categories c ON pc.category_id = c.id
WHERE c.slug = 'other';

-- Check how many prompts still don't have any categories (should be 0)
SELECT 
  COUNT(*) as prompts_still_without_categories
FROM public.prompts p
LEFT JOIN public.prompt_categories pc ON p.id = pc.prompt_id
WHERE pc.prompt_id IS NULL;
