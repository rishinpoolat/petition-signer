-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON petitioners;
DROP POLICY IF EXISTS "Users can insert their own profile" ON petitioners;
DROP POLICY IF EXISTS "Users can update own profile" ON petitioners;
DROP POLICY IF EXISTS "Users can delete own profile" ON petitioners;

-- Create new policies for petitioners
CREATE POLICY "Public profiles are viewable by everyone" 
ON petitioners FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON petitioners FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" 
ON petitioners FOR UPDATE 
TO authenticated
USING (id = auth.uid());

-- Checking petitioners RLS status
ALTER TABLE petitioners ENABLE ROW LEVEL SECURITY;