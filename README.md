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

### Facebook Pixel & Conversions API
- Browser Pixel: initialized in `app/layout.tsx` using `NEXT_PUBLIC_FB_PIXEL_ID`. Tracks `PageView` by default.
- Client events implemented:
  - `ViewContent`: in `src/react-app/pages/Home.tsx`
  - `InitiateCheckout`: in `src/react-app/components/OrderForm.tsx` (on form mount)
  - `AddToCart`: in `src/react-app/components/OrderForm.tsx` (on package select)
  - `Purchase`: fired after successful order submission with `{ eventID: orderNumber }` for deduplication.
- Server-side CAPI:
  - `Purchase` sent from `app/api/orders/route.ts` using `src/lib/fb.ts::sendServerEvent()` with `event_id = orderNumber` and `fbp/fbc`, IP, UA.

Environment variables:
```
NEXT_PUBLIC_FB_PIXEL_ID="your-pixel-id"            # public (client)
FB_CAPI_ACCESS_TOKEN="your-capi-access-token"     # server-only secret
```
Add them to `.env.local`. Example variables are listed in `.env.example`.

QA (Meta Events Manager > Test Events):
- Open the site with the test code active and perform flows:
  - Load home: expect Browser `PageView` and `ViewContent`.
  - Select a package: expect Browser `AddToCart`.
  - Open order form: expect Browser `InitiateCheckout`.
  - Submit order: expect Browser `Purchase` and Server `Purchase` with status `Deduplicated`.
- Any server-side errors are logged but do not break order flow.
