# Ruhafiya Landing Page

A modern, beautiful landing page for Ruhafiya pain relief oil with admin panel and Supabase integration.

## Features

### Landing Page
- 🎨 Modern, responsive design with Bengali language support
- 🌟 Beautiful hero section with animated elements
- 📋 Product benefits showcase
- 🖼️ Interactive product gallery
- 💬 Customer testimonials carousel
- 💰 Pricing section with bundle offers
- 📝 Order form with validation
- 📱 Mobile-first responsive design

### Admin Panel
- 🔐 Secure admin authentication
- 📊 Dashboard with order statistics
- 📦 Order management with status updates
- ✏️ Website content editor (edit all content from admin panel)
- 🎛️ Real-time content management
- 📈 Performance analytics

### Technical Features
- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 🗄️ Supabase for database and authentication
- 📱 Fully responsive design
- 🔒 Secure admin authentication with JWT
- 🌐 Bengali language support
- 📊 Real-time data updates

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ruhafiya-landing
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to SQL Editor and run the `database-schema.sql` file to create tables
4. Update your `.env.local` file with Supabase credentials

### 3. Environment Variables

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_EMAIL=admin@ruhafiya.com
ADMIN_PASSWORD=your_secure_admin_password

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Database Setup

Run the SQL commands in `database-schema.sql` in your Supabase SQL editor. This will:
- Create necessary tables (orders, admin_users, website_content)
- Insert default admin user (email: admin@ruhafiya.com, password: admin123)
- Set up default website content
- Configure Row Level Security policies

### 5. Run the Application

```bash
npm run dev
```

Visit:
- Landing page: http://localhost:3000
- Admin login: http://localhost:3000/admin/login
- Admin dashboard: http://localhost:3000/admin/dashboard

## Default Admin Credentials

**⚠️ IMPORTANT: Change these in production!**

- Email: `admin@ruhafiya.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   └── admin/
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── OrdersTable.tsx
│   │   └── WebsiteEditor.tsx
│   ├── Hero.tsx
│   ├── Benefits.tsx
│   ├── ProductGallery.tsx
│   ├── Testimonials.tsx
│   ├── Pricing.tsx
│   ├── OrderForm.tsx
│   └── Footer.tsx
└── lib/
    ├── supabase.ts
    └── auth.ts
```

## Admin Panel Features

### Dashboard
- Order statistics overview
- Quick action buttons
- System status indicators
- Performance metrics

### Order Management
- View all orders with filtering
- Update order status (pending → paid → completed)
- Search orders by customer name, phone, or order ID
- Delete orders
- View detailed order information

### Website Content Editor
- Edit hero section content
- Modify benefits section
- Update pricing information
- Change footer content
- Real-time preview of changes

## Database Schema

### Tables
1. **admin_users** - Admin authentication
2. **orders** - Customer orders
3. **website_content** - Editable website content

### Security
- Row Level Security (RLS) enabled
- JWT-based admin authentication
- Secure password hashing with bcrypt

## Customization

### Adding New Content Sections
1. Add new section to `WebsiteEditor.tsx`
2. Create corresponding component
3. Update database schema if needed

### Styling
- All styles use Tailwind CSS
- Custom styles in `globals.css`
- Bengali font support included

### Adding Features
- API routes in `src/app/api/`
- Components in `src/components/`
- Database functions in `src/lib/`

## Production Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
- Update `NEXTAUTH_URL` to your production domain
- Use strong, unique passwords
- Keep Supabase keys secure

## Security Considerations

1. **Change default admin password**
2. **Use strong NEXTAUTH_SECRET**
3. **Enable Supabase RLS policies**
4. **Use HTTPS in production**
5. **Regularly update dependencies**

## Support

For support or questions about this project, please contact the development team.

## License

This project is proprietary and confidential.