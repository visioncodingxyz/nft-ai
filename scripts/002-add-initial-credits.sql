-- Add default generation credit for new users
ALTER TABLE users 
ALTER COLUMN purchased_generations SET DEFAULT 1;

-- Update existing users who have 0 purchased_generations to have 1
UPDATE users 
SET purchased_generations = 1 
WHERE purchased_generations = 0 OR purchased_generations IS NULL;
