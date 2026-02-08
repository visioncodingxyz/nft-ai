-- Migration script to update all existing NFTs to use the new attribute system
-- This script converts old attributes (style, prompt, nsfwMode) to the new format

-- For non-NSFW NFTs: Only "Art Style" attribute
-- For NSFW NFTs: Art Style, Filter, Emotion, Quality, Age, Body Weight, Breast Size, Ass Size

DO $$
DECLARE
    nft_record RECORD;
    old_attributes JSONB;
    new_attributes JSONB;
    style_value TEXT;
    is_nsfw_value BOOLEAN;
BEGIN
    -- Loop through all NFTs
    FOR nft_record IN SELECT id, attributes, is_nsfw FROM nfts
    LOOP
        old_attributes := nft_record.attributes;
        is_nsfw_value := COALESCE(nft_record.is_nsfw, false);
        
        -- Extract style from old attributes
        -- Old format: { "style": "realistic", "prompt": "...", "nsfwMode": true/false }
        style_value := COALESCE(old_attributes->>'style', 'realistic');
        
        -- Create new attributes based on NSFW status
        IF is_nsfw_value = false THEN
            -- Non-NSFW: Only Art Style attribute
            new_attributes := jsonb_build_array(
                jsonb_build_object(
                    'trait_type', 'Art Style',
                    'value', style_value
                )
            );
        ELSE
            -- NSFW: All attributes with defaults
            new_attributes := jsonb_build_array(
                jsonb_build_object('trait_type', 'Art Style', 'value', style_value),
                jsonb_build_object('trait_type', 'Filter', 'value', 'Default'),
                jsonb_build_object('trait_type', 'Emotion', 'value', 'Default'),
                jsonb_build_object('trait_type', 'Quality', 'value', 'Ultra'),
                jsonb_build_object('trait_type', 'Age', 'value', '25'),
                jsonb_build_object('trait_type', 'Body Weight', 'value', '0.0'),
                jsonb_build_object('trait_type', 'Breast Size', 'value', '0.0'),
                jsonb_build_object('trait_type', 'Ass Size', 'value', '0.0')
            );
        END IF;
        
        -- Update the NFT with new attributes
        UPDATE nfts 
        SET attributes = new_attributes
        WHERE id = nft_record.id;
        
        RAISE NOTICE 'Updated NFT ID %: % attributes', nft_record.id, 
            CASE WHEN is_nsfw_value THEN '8' ELSE '1' END;
    END LOOP;
    
    RAISE NOTICE 'Migration complete! All NFTs have been updated with new attribute format.';
END $$;
