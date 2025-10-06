-- Migration script to update model names and remove deprecated models
-- Run this script to update existing prompts in the database

-- Rename Pi to Ollama
UPDATE prompts 
SET model = 'Ollama' 
WHERE model = 'Pi';

-- Rename Llama to Meta
UPDATE prompts 
SET model = 'Meta' 
WHERE model = 'Llama';

-- Merge Claude-3 into Claude
UPDATE prompts 
SET model = 'Claude' 
WHERE model = 'Claude-3';

-- Remove prompts with deprecated models (Jasper, Alpaca, Falcon)
-- Option 1: Delete prompts with deprecated models
DELETE FROM prompts 
WHERE model IN ('Jasper', 'Alpaca', 'Falcon');

-- Option 2: If you prefer to keep the prompts but change them to 'Other'
-- Uncomment the following lines and comment out the DELETE above:
-- UPDATE prompts 
-- SET model = 'Other' 
-- WHERE model IN ('Jasper', 'Alpaca', 'Falcon');

-- Verify the updates
SELECT model, COUNT(*) as count 
FROM prompts 
GROUP BY model 
ORDER BY model;
