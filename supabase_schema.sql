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

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Public Read Brands" ON public.brands;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;

DROP POLICY IF EXISTS "Admin Write Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Write Brands" ON public.brands;
DROP POLICY IF EXISTS "Admin Write Products" ON public.products;

DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;

-- Allow public read access to everyone
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- Allow authenticated admin full access
CREATE POLICY "Admin Write Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Brands" ON public.brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- 5. Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Insert Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
