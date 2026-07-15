# Sona — Toothbrush Landing Page

A minimal, responsive landing page (React + Vite + Tailwind) with a Supabase-backed
order form. Palette and gradient are taken from the mint / blush / sand tones of the
product photo.

## 1. Set up Supabase

Run this in your Supabase project's SQL editor (already matches the table you provided):

```sql
CREATE TABLE public.landingPages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','confirmed','in_revision','preparing','shipped','delivered','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Allow the public form to insert new orders
ALTER TABLE public.landingPages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create orders"
  ON public.landingPages
  FOR INSERT
  TO anon
  WITH CHECK (true);
```

(RLS is on by default in Supabase, so without an INSERT policy the form submissions
will fail — the policy above allows anonymous visitors to create rows only, not read
or edit them.)

## 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your project's values (Supabase dashboard →
Project Settings → API):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Install and run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- Unit price is set in `src/App.jsx` (`UNIT_PRICE`, currently 4500 DA) — the `total`
  column is computed client-side as `quantity × UNIT_PRICE` and sent on submit.
- Quantity is capped between 1 and 10 in the UI; adjust in `adjustQty` if you need a
  different range.
- The form only writes to `landingPages`; it never reads from it, so the anon INSERT
  policy above is all you need for this page to work.
