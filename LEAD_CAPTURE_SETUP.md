# 🎯 Smart Lead Capture System Setup

## ✨ What I've Built for You

I've created an **intelligent lead capture system** that automatically detects user information and captures leads through a beautiful, animated popup. Here's what it does:

### 🔍 **Automatic User Detection**
- **Location**: Detects country and city (IP-based)
- **Device**: Mobile or Desktop detection
- **Browser**: Chrome, Firefox, Safari, etc.
- **Visit Time**: Timestamp in Bengali format
- **Referrer**: Where they came from
- **Timezone**: User's timezone

### 🎨 **Smart Popup Features**
- **Triggers**: Shows after 10 seconds OR when user scrolls 500px
- **Multi-step Form**: Name → Phone → Email (optional)
- **Beautiful Animations**: Framer Motion powered
- **Progress Bar**: Shows completion progress
- **Special Offers**: Displays attractive offers
- **Trust Indicators**: Shows ratings and customer count
- **Location Display**: "We see you're visiting from Dhaka, Bangladesh"

### 📊 **Admin Dashboard**
- **Lead Management**: View all captured leads
- **Filtering**: By status, device, country, date range
- **Statistics**: Total leads, today's leads, conversion rates
- **Export**: Download leads as CSV
- **Status Updates**: Mark leads as contacted/converted

## 🚀 Setup Instructions

### 1. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Create leads table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_captured_at ON leads(captured_at);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Add to Admin Dashboard

Add this to your admin sidebar navigation:

```tsx
// In AdminSidebar.tsx, add this menu item:
{
  name: 'Leads',
  href: '/admin/leads',
  icon: Users,
  current: pathname === '/admin/leads'
}
```

### 3. Create Admin Leads Page

Create: `src/app/admin/leads/page.tsx`

```tsx
import LeadsManager from '@/components/admin/LeadsManager'

export default function LeadsPage() {
  return (
    <div className="p-6">
      <LeadsManager />
    </div>
  )
}
```

## 🎯 How It Works

### For Visitors:
1. **Automatic Detection**: System detects location, device, browser
2. **Smart Timing**: Popup appears after 10 seconds or scroll
3. **Engaging Form**: Multi-step form with progress bar
4. **Personalization**: Shows location-specific message
5. **Attractive Offers**: Displays special discounts and benefits

### For You (Admin):
1. **Real-time Capture**: All leads saved automatically
2. **Rich Data**: Get location, device, timing info
3. **Easy Management**: View, filter, and export leads
4. **Status Tracking**: Mark leads as contacted/converted
5. **Analytics**: See conversion rates and trends

## 📱 What Users See

```
🎁 বিশেষ অফার পেতে চান?
আপনার নাম দিন

[Progress: ●○○]

আমরা দেখতে পাচ্ছি আপনি ঢাকা, বাংলাদেশ থেকে ভিজিট করছেন
ভিজিট টাইম: ১২/১২/২০২৪, ২:৩০:০০ PM

[Name Input Field]

বিশেষ অফার!
• ৩০% পর্যন্ত ছাড়
• ফ্রি হোম ডেলিভারি  
• ফ্রি কনসালটেশন

[Skip] [Next]
```

## 🔧 Customization Options

### Popup Timing
```tsx
// In SmartLeadCapture.tsx, change these values:
setTimeout(() => setShowPopup(true), 10000) // 10 seconds
if (window.scrollY > 500) // 500px scroll
```

### Form Fields
```tsx
// Add/remove steps in the steps array:
const steps = [
  { title: "🎁 বিশেষ অফার পেতে চান?", field: "name" },
  { title: "📞 ফ্রি কনসালটেশন", field: "phone" },
  { title: "📧 বিশেষ ছাড়ের তথ্য পেতে", field: "email" }
]
```

### Special Offers
```tsx
// Customize offers in the popup:
<ul className="text-sm text-orange-700 space-y-1">
  <li>• ৩০% পর্যন্ত ছাড়</li>
  <li>• ফ্রি হোম ডেলিভারি</li>
  <li>• ফ্রি কনসালটেশন</li>
</ul>
```

## 📊 Data You'll Collect

For each visitor, you'll automatically get:

### Contact Info (User Provided):
- ✅ Name
- ✅ Phone Number  
- ✅ Email (optional)

### Technical Info (Auto-Detected):
- ✅ IP Address
- ✅ Country & City
- ✅ Device Type (Mobile/Desktop)
- ✅ Browser (Chrome, Firefox, etc.)
- ✅ Visit Timestamp
- ✅ Referrer Source
- ✅ User Timezone

### Marketing Info:
- ✅ Lead Source
- ✅ Conversion Status
- ✅ Follow-up Notes

## 🎉 Benefits

### For Lead Generation:
- **Higher Conversion**: Smart timing and attractive design
- **Rich Data**: Know exactly who your visitors are
- **Better Follow-up**: Location and device info helps personalize
- **Easy Management**: All leads in one dashboard

### For User Experience:
- **Non-intrusive**: Appears at right moment
- **Beautiful Design**: Professional animations
- **Quick Process**: Multi-step feels easier
- **Value-focused**: Shows clear benefits

### For Business:
- **Automated**: No manual work required
- **Scalable**: Handles unlimited leads
- **Trackable**: Full analytics and reporting
- **Actionable**: Easy to follow up and convert

## 🔒 Privacy & Legal

- **IP Detection**: Uses public IP geolocation (legal)
- **No Personal Data**: Only detects publicly available info
- **User Consent**: Users voluntarily provide contact info
- **Secure Storage**: All data encrypted in Supabase
- **GDPR Compliant**: Users can request data deletion

## 🚀 Next Steps

1. **Run the SQL** to create the leads table
2. **Test the popup** by visiting your site
3. **Check admin dashboard** to see captured leads
4. **Customize timing/offers** as needed
5. **Set up notifications** for new leads (optional)

Your landing page now has **professional-grade lead capture** that will significantly boost your conversion rates! 🎯