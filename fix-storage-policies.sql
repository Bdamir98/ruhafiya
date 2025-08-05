-- Supabase Storage RLS Policies Fix
-- Run this SQL script in your Supabase SQL Editor

-- First, let's check if RLS is enabled on storage tables
-- Enable RLS on storage buckets and objects
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Create new policies for public access to our specific buckets
-- Policy for public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public upload access
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public update access
CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Policy for public delete access
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Also create bucket-level policies
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
CREATE POLICY "Public bucket access" ON storage.buckets
FOR SELECT USING (id IN ('product-images', 'testimonial-images', 'hero-images', 'general-media'));

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('objects', 'buckets') 
AND schemaname = 'storage';