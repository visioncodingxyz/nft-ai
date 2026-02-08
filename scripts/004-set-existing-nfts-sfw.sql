-- Set all existing NFTs to is_nsfw = false
-- This ensures that NFTs created before the NSFW feature was added are marked as SFW

UPDATE nfts
SET is_nsfw = false
WHERE is_nsfw IS NULL;
