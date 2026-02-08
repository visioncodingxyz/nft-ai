-- Capitalize all attribute values in the database
-- This script updates all NFT attributes to ensure proper capitalization

-- Update attributes to capitalize first letter of values
UPDATE nfts
SET attributes = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'trait_type', attr->>'trait_type',
      'value', 
      CASE 
        -- Keep numeric values as-is
        WHEN attr->>'value' ~ '^[0-9]+(\.[0-9]+)?$' THEN attr->>'value'
        -- Capitalize first letter of text values
        ELSE INITCAP(attr->>'value')
      END
    )
  )
  FROM jsonb_array_elements(attributes) AS attr
)
WHERE attributes IS NOT NULL
  AND jsonb_typeof(attributes) = 'array';

-- Verify the update
SELECT 
  id,
  name,
  attributes
FROM nfts
WHERE attributes IS NOT NULL
LIMIT 10;
