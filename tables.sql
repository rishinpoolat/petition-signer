-- Create enum for petition status
CREATE TYPE petition_status AS ENUM ('open', 'closed');

-- Create petitioners table
CREATE TABLE petitioners (
    id UUID PRIMARY KEY DEFAULT auth.uid(),  -- Changed from BIGSERIAL to UUID
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio_id VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create petitions table
CREATE TABLE petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Changed from BIGSERIAL to UUID
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status petition_status DEFAULT 'open',
    petitioner_id UUID REFERENCES petitioners(id),  -- Changed BIGINT to UUID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    response TEXT,
    signature_threshold INTEGER DEFAULT 0
);

-- Create signatures table
CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Changed from BIGSERIAL to UUID
    petition_id UUID REFERENCES petitions(id),      -- Changed BIGINT to UUID
    petitioner_id UUID REFERENCES petitioners(id),  -- Changed BIGINT to UUID
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(petition_id, petitioner_id)
);

-- Create admin table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Changed from BIGSERIAL to UUID
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin account
INSERT INTO admins (email, password_hash)
VALUES ('admin@petition.parliament.sr', '$2b$10$YOUR_HASHED_PASSWORD');

-- Create indexes for better performance
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_signatures_petition ON signatures(petition_id);
CREATE INDEX idx_signatures_petitioner ON signatures(petitioner_id);

-- Create view for petition statistics
CREATE VIEW petition_stats AS
SELECT 
    p.id,
    p.title,
    p.status,
    COUNT(s.id) as signature_count,
    p.signature_threshold,
    p.created_at
FROM petitions p
LEFT JOIN signatures s ON p.id = s.petition_id
GROUP BY p.id;

-- Add RLS (Row Level Security) policies
ALTER TABLE petitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies for petitioners
CREATE POLICY "Public profiles are viewable by everyone" 
ON petitioners FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile"
ON petitioners FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policies for petitions
CREATE POLICY "Petitions are viewable by everyone" 
ON petitions FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create petitions" 
ON petitions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = petitioner_id::text);

-- Policies for signatures
CREATE POLICY "Signatures are viewable by everyone" 
ON signatures FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can sign petitions" 
ON signatures FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = petitioner_id::text);