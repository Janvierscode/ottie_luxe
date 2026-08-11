begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

select has_table('public', 'products', 'products table exists');
select has_table('public', 'product_variants', 'variants table exists');
select has_table('public', 'promotions', 'promotions table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.products'::regclass), 'products enforce RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.product_images'::regclass), 'product images enforce RLS');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Public reads published products'), 'published catalogue read policy exists');
select ok(exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Owner updates products'), 'owner product update policy exists');
select ok(not exists(select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and cmd = 'DELETE'), 'products cannot be permanently deleted through the catalogue API');
select ok(exists(select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Owner uploads product image files'), 'owner storage upload policy exists');
select has_function('public', 'is_active_admin', array[]::text[], 'owner check function exists');
select has_function('public', 'replace_product_configuration', array['text', 'jsonb', 'jsonb'], 'atomic product configuration function exists');
select ok(not has_function_privilege('anon', 'public.replace_product_configuration(text,jsonb,jsonb)', 'EXECUTE'), 'anonymous users cannot replace variants');

select * from finish();
rollback;
