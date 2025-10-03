-- Migration script to update ChatGPT references to GPT
-- Run this script to update existing prompts in the database

-- Update any existing prompts that have 'ChatGPT' as the model
UPDATE prompts 
SET model = 'GPT' 
WHERE model = 'ChatGPT';

-- Verify the update
SELECT model, COUNT(*) as count 
FROM prompts 
GROUP BY model 
ORDER BY model;
