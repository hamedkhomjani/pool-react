-- ========================================================
-- SUPABASE SCHEMA FOR POOL-REACT CMS
-- Execute this script in Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name_fa TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_fa TEXT,
    description_en TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    description_fa TEXT,
    description_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Create admin_users allowlist (the only accounts allowed to write)
CREATE TABLE IF NOT EXISTS public.admin_users (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    compare_at NUMERIC,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    badge TEXT,
    featured BOOLEAN DEFAULT false,
    offer_expires_at TIMESTAMP WITH TIME ZONE,
    image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    title_fa TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_fa TEXT,
    subtitle_en TEXT,
    description_fa TEXT,
    description_en TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    features_fa JSONB DEFAULT '[]'::jsonb,
    features_en JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Brands" ON public.brands;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;

DROP POLICY IF EXISTS "Admin Write Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Write Brands" ON public.brands;
DROP POLICY IF EXISTS "Admin Write Products" ON public.products;

DROP POLICY IF EXISTS "Admin Read Own Membership" ON public.admin_users;
DROP POLICY IF EXISTS "Admin Read Membership" ON public.admin_users;
DROP POLICY IF EXISTS "Admin Insert Membership" ON public.admin_users;
DROP POLICY IF EXISTS "Admin Delete Membership" ON public.admin_users;

DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;

-- 4.5 SECURITY DEFINER helper: is the current user in the admin allowlist?
-- Runs as the table owner, so it can safely read admin_users without RLS
-- recursion. Policies on admin_users must use this instead of querying the
-- table directly (a policy cannot select from its own table).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users WHERE email = (auth.jwt() ->> 'email')
    )
$$;

-- Allow public read access to everyone (storefront)
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- Admins can view the full allowlist (used by the Team page)
CREATE POLICY "Admin Read Membership" ON public.admin_users
    FOR SELECT USING (public.is_admin());

-- Admins can add new admins
CREATE POLICY "Admin Insert Membership" ON public.admin_users
    FOR INSERT WITH CHECK (public.is_admin());

-- Admins can remove OTHER admins, but never themselves (prevents lockout)
CREATE POLICY "Admin Delete Membership" ON public.admin_users
    FOR DELETE USING (public.is_admin() AND email <> (auth.jwt() ->> 'email'));

-- Writes are allowed ONLY for allowlisted admins.
-- (The service role bypasses RLS, so you grant the first admin via SQL Editor.)
CREATE POLICY "Admin Write Categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Admin Write Brands" ON public.brands
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());

CREATE POLICY "Admin Write Products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());

-- 5. Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Insert Images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
);
CREATE POLICY "Admin Update Images" ON storage.objects FOR UPDATE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
);
CREATE POLICY "Admin Delete Images" ON storage.objects FOR DELETE USING (
    bucket_id = 'product-images'
    AND public.is_admin()
);

-- 6. Grant yourself admin access!
-- IMPORTANT: replace 'your-admin@email.com' with YOUR OWN email, then run the
-- whole script (or just this INSERT).
INSERT INTO public.admin_users (email)
VALUES ('your-admin@email.com')
ON CONFLICT (email) DO NOTHING;