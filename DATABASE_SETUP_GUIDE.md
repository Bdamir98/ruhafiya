# Ruhafiya Admin Panel Database Setup Guide

## Issue
When clicking on "Inventory" in the admin panel, you get this error:
```
Error: relation "public.inventory" does not exist
Error: relation "public.stock_movements" does not exist
```

This happens because the required database tables haven't been created in your Supabase database yet.

## Solution

### Step 1: Run Database Setup SQL

1. **Open your Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `ugfrjijagqiwpviqiwbi`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Database Setup**
   - Copy the entire content from `database-setup.sql` file
   - Paste it in the SQL Editor
   - Click "Run" to execute

### Step 2: Create Admin User

1. **In the same SQL Editor**
   - Copy the content from `create-admin-user.sql` file  
   - Paste it in the SQL Editor
   - Click "Run" to execute

### Step 3: Test the Setup

1. **Login to Admin Panel**
   - Go to: http://localhost:3000/admin/login
   - Email: `admin@ruhafiya.com`
   - Password: `admin123`

2. **Test Inventory**
   - Click on "Inventory" in the sidebar
   - You should see the default "Ruhafiya Pain Relief Oil" product
   - No more database errors!

## What Gets Created

### Tables:
- ✅ `admin_users` - Admin user accounts
- ✅ `admin_sessions` - Login sessions
- ✅ `inventory` - Product inventory management
- ✅ `stock_movements` - Stock movement history
- ✅ `orders` - Customer orders
- ✅ `leads` - Lead capture data
- ✅ `hero_slides` - Homepage slider content
- ✅ `security_events` - Security audit log
- ✅ `website_content` - Dynamic website content

### Functions:
- ✅ `log_security_event()` - Log security events
- ✅ `handle_failed_login()` - Handle failed login attempts
- ✅ `reset_failed_login_attempts()` - Reset login attempts

### Default Data:
- ✅ Admin user: `admin@ruhafiya.com` (password: `admin123`)
- ✅ Default product: "Ruhafiya Pain Relief Oil" with 100 units in stock
- ✅ Hero slides with Bengali content

## Security Notes

⚠️ **IMPORTANT**: Change the default admin password immediately after first login!

The default credentials are:
- Email: `admin@ruhafiya.com`
- Password: `admin123`

## Troubleshooting

If you still get errors after setup:

1. **Check if tables were created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Check if admin user was created**:
   ```sql
   SELECT email, is_active FROM admin_users;
   ```

3. **Check inventory data**:
   ```sql
   SELECT * FROM inventory;
   ```

## Complete Website Editor Setup

After setting up the basic database, run the website content setup:

### Step 4: Setup Website Content

1. **In Supabase SQL Editor**
   - Copy content from `complete-website-content-setup.sql`
   - Paste and run in SQL Editor

### Step 5: Test Website Editor

1. **Login to Admin Panel**
   - Go to admin dashboard
   - Click "Website Editor" in sidebar

2. **Available Sections to Edit:**
   - ✅ **Hero Slider** - Homepage banner slides
   - ✅ **Hero Section** - Main hero content
   - ✅ **Benefits Section** - Product benefits with icons
   - ✅ **Product Gallery** - Product images
   - ✅ **Customer Reviews** - Testimonials with ratings
   - ✅ **Pricing** - Product pricing and offers
   - ✅ **Order Form** - Order form configuration
   - ✅ **Footer** - Company info and social links

3. **Edit Any Section:**
   - Select section from sidebar
   - Edit content in the form
   - Click "Save" to update
   - Click "Preview" to see changes

## What You Can Edit

### 🎯 **Hero Section**
- Main title and subtitle
- Description text
- Customer count
- Call-to-action button text
- Background image

### 🌟 **Benefits Section**
- Section title and subtitle
- Up to 6 benefits with:
  - Custom icons (heart, shield, zap, etc.)
  - Benefit titles
  - Descriptions

### 🖼️ **Product Gallery**
- Gallery title and subtitle
- Up to 4 product images
- Image upload functionality

### 💬 **Customer Reviews**
- Section title and subtitle
- Up to 5 testimonials with:
  - Customer names and locations
  - Star ratings (1-5)
  - Review comments

### 💰 **Pricing Section**
- Section title and subtitle
- Single package price
- Bundle package price
- Original prices for discount calculation
- Feature list

### 📝 **Order Form**
- Form title and subtitle
- Package pricing
- Form configuration

### 🔗 **Footer**
- Company name and description
- Contact information (phone, email, address)
- Social media links (Facebook, Instagram, YouTube)

## Next Steps

After successful setup:
1. Login to admin panel
2. Change default password
3. **Edit website content** using the Website Editor
4. Add your actual products to inventory
5. Customize hero slides content
6. Upload real product images
7. Add genuine customer testimonials
8. Update contact information
9. Start managing orders and leads

The complete admin panel is now ready with:
- ✅ Inventory management
- ✅ Order management
- ✅ Complete website content editing
- ✅ Analytics and reporting
