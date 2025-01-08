-- Drop existing view if it exists
DROP VIEW IF EXISTS petition_stats;

-- Create updated view
CREATE OR REPLACE VIEW petition_stats AS
SELECT 
    p.id,
    p.title,
    p.content,
    p.status,
    p.signature_threshold,
    p.created_at,
    p.response,
    p.petitioner_id,
    pet.email as petitioner_email,
    COUNT(s.id) as signature_count
FROM petitions p
LEFT JOIN signatures s ON p.id = s.petition_id
LEFT JOIN petitioners pet ON p.petitioner_id = pet.id
GROUP BY 
    p.id,
    p.title,
    p.content,
    p.status,
    p.signature_threshold,
    p.created_at,
    p.response,
    p.petitioner_id,
    pet.email;