-- Create leads table for capturing user information
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  
  -- Contact Information
  name VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  interest VARCHAR(100) DEFAULT 'general',
  
  -- User Detection Info
  ip_address VARCHAR(45),
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device VARCHAR(50),
  browser VARCHAR(50),
  timezone VARCHAR(100),
  
  -- Metadata
  source VARCHAR(100) DEFAULT 'landing_page',
  status VARCHAR(50) DEFAULT 'new',
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional fields
  notes TEXT,
  follow_up_date DATE,
  converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_captured_at ON leads(captured_at);
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads(country);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (admin access)
CREATE POLICY "Admin can manage leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policy for inserting leads (public access for lead capture)
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Insert some sample data (optional)
INSERT INTO leads (name, phone, email, country, city, device, source) VALUES
('Test User', '01700000000', 'test@example.com', 'Bangladesh', 'Dhaka', 'Mobile', 'landing_page_popup'),
('Sample Lead', '01800000000', 'sample@example.com', 'Bangladesh', 'Chittagong', 'Desktop', 'landing_page_form');

-- Create a view for lead analytics
CREATE OR REPLACE VIEW lead_analytics AS
SELECT 
  DATE(captured_at) as date,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as leads_with_phone,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as leads_with_email,
  COUNT(CASE WHEN converted = true THEN 1 END) as converted_leads,
  country,
  city,
  device,
  source
FROM leads 
GROUP BY DATE(captured_at), country, city, device, source
ORDER BY date DESC;