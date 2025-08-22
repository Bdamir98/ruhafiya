## Ruhafiya - ব্যথা মুক্তির জন্য আপনার নির্ভরযোগ্য সমাধান

Stack has been migrated to Next.js + Supabase while keeping the UI and API behavior the same.

### Tech
- Next.js (app router) under `app/`
- TailwindCSS (`tailwind.config.js`)
- Supabase (Postgres) via `@supabase/supabase-js` (`src/lib/supabase-server.ts`)

### Environment
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Note: service role is used server-side in API routes. Do not expose it to the client.

### Database
Create tables in Supabase using `supabase/schema.sql`:
```
-- In Supabase SQL editor, paste contents of supabase/schema.sql and run
```

### Develop
```
npm install
npm run dev
```

### API Endpoints (unchanged paths)
- POST `/api/orders`
- GET `/api/products`
- POST `/api/admin/login`
- GET `/api/admin/orders`
