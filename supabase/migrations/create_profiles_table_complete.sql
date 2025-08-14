-- Create profiles table with all fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Passport information
  passport_nationality VARCHAR(2),
  passport_issue_date DATE,
  passport_expiry_date DATE,
  
  -- Emergency contact
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(50),
  
  -- Preferences
  preferred_currency VARCHAR(3) DEFAULT 'USD',
  travel_insurance_provider VARCHAR(100),
  travel_insurance_policy_number VARCHAR(100),
  notification_days_before_visa_expiry INTEGER DEFAULT 30,
  notification_days_before_passport_expiry INTEGER DEFAULT 180,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();