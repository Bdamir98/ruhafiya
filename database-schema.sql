-- Ruhafiya Landing Page Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    product_quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create website_content table
CREATE TABLE IF NOT EXISTS website_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section VARCHAR(50) UNIQUE NOT NULL,
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Note: Change this password in production!
INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@ruhafiya.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrKxQ7u')
ON CONFLICT (email) DO NOTHING;

-- Insert default website content
INSERT INTO website_content (section, content) VALUES 
('hero', '{
    "title": "রুহাফিয়া",
    "subtitle": "প্রাকৃতিক ব্যথা নিরাময়ের তেল",
    "description": "১৫-২০ দিন নিয়মিত ব্যবহার করলে হাটু ব্যথা, কাধ ব্যথা, বাত ব্যথা, কোমর ব্যথা সহ সকল ব্যথা দূর হবে ইনশাল্লাহ",
    "customerCount": "৭০,০০০+",
    "buttonText": "অর্ডার করুন"
}'),
('benefits', '{
    "title": "রুহাফিয়া তেলের উপকারিতা",
    "subtitle": "প্রাকৃতিক উপাদানে তৈরি, সকল ধরনের ব্যথার জন্য কার্যকর"
}'),
('pricing', '{
    "title": "বিশেষ অফার মূল্য",
    "subtitle": "সীমিত সময়ের জন্য বিশেষ ছাড়",
    "singlePrice": 890,
    "bundlePrice": 1650
}'),
('footer', '{
    "companyName": "রুহাফিয়া",
    "description": "প্রাকৃতিক ব্যথা নিরাময়ের তেল - আপনার সুস্বাস্থ্যের জন্য প্রাকৃতিক সমাধান",
    "phone": "+880 1XXX-XXXXXX",
    "email": "info@ruhafiya.com",
    "address": "ঢাকা, বাংলাদেশ"
}')
ON CONFLICT (section) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_website_content_section ON website_content(section);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "Admin users can read their own data" ON admin_users
    FOR SELECT USING (true);

-- Create policies for orders table
CREATE POLICY "Allow public insert on orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Allow public update on orders" ON orders
    FOR UPDATE USING (true);

-- Create policies for website_content table
CREATE POLICY "Allow public read on website_content" ON website_content
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on website_content" ON website_content
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on website_content" ON website_content
    FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_content_updated_at 
    BEFORE UPDATE ON website_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();