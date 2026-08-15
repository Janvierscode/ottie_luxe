create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  image_url text,
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  category_id text not null references public.categories(id),
  description text not null check (char_length(description) between 10 and 240),
  long_description text not null check (char_length(long_description) between 20 and 1200),
  price_cents integer not null check (price_cents > 0),
  old_price_cents integer check (old_price_cents is null or old_price_cents > price_cents),
  badge text check (badge is null or badge in ('New', 'Popular', 'Sale')),
  featured boolean not null default false,
  is_new boolean not null default false,
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_options (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  values jsonb not null default '[]'::jsonb check (jsonb_typeof(values) = 'array'),
  sort_order integer not null default 0
);

create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  option_values jsonb not null default '{}'::jsonb check (jsonb_typeof(option_values) = 'object'),
  sku text unique,
  price_cents integer check (price_cents is null or price_cents > 0),
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  active boolean not null default true
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  storage_path text,
  alt_text text not null check (char_length(alt_text) between 5 and 180),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id text primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text not null,
  description text not null,
  price_label text not null,
  image_url text,
  product_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(product_ids) = 'array'),
  starts_at timestamptz,
  ends_at timestamptz,
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists products_public_catalogue_idx on public.products(publication_status, sort_order);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists images_product_idx on public.product_images(product_id, sort_order);
create unique index if not exists one_primary_image_per_product_idx on public.product_images(product_id) where is_primary = true;
create index if not exists promotions_public_idx on public.promotions(publication_status, sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists promotions_updated_at on public.promotions;
create trigger promotions_updated_at before update on public.promotions for each row execute function public.set_updated_at();

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid()) and active = true
  );
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to anon, authenticated;

create or replace function public.replace_product_configuration(
  p_product_id text,
  p_options jsonb,
  p_variants jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not public.is_active_admin() then
    raise exception 'Owner access is required';
  end if;
  if jsonb_typeof(p_options) <> 'array' or jsonb_array_length(p_options) > 2 then
    raise exception 'A product may have no more than two option groups';
  end if;
  if jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) > 100 then
    raise exception 'Invalid product variants';
  end if;

  delete from public.product_options where product_id = p_product_id;
  delete from public.product_variants where product_id = p_product_id;

  insert into public.product_options (id, product_id, name, values, sort_order)
  select
    'option-' || gen_random_uuid()::text,
    p_product_id,
    option_row->>'name',
    option_row->'values',
    coalesce((option_row->>'sort_order')::integer, option_ordinality::integer)
  from jsonb_array_elements(p_options) with ordinality as option_items(option_row, option_ordinality);

  insert into public.product_variants (id, product_id, label, option_values, price_cents, stock_status, active)
  select
    'variant-' || gen_random_uuid()::text,
    p_product_id,
    variant_row->>'label',
    variant_row->'option_values',
    nullif(variant_row->>'price_cents', '')::integer,
    variant_row->>'stock_status',
    coalesce((variant_row->>'active')::boolean, true)
  from jsonb_array_elements(p_variants) as variant_items(variant_row);
end;
$$;

revoke all on function public.replace_product_configuration(text, jsonb, jsonb) from public;
grant execute on function public.replace_product_configuration(text, jsonb, jsonb) to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.promotions enable row level security;

create policy "Owner reads own profile" on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()));

create policy "Public reads active categories" on public.categories for select to anon, authenticated using (active = true or public.is_active_admin());
create policy "Owner inserts categories" on public.categories for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates categories" on public.categories for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Owner deletes categories" on public.categories for delete to authenticated using (public.is_active_admin());

create policy "Public reads published products" on public.products for select to anon, authenticated using (publication_status = 'published' or public.is_active_admin());
create policy "Owner inserts products" on public.products for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates products" on public.products for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public reads options for published products" on public.product_options for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_active_admin())));
create policy "Owner manages product options" on public.product_options for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Public reads variants for published products" on public.product_variants for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_active_admin())));
create policy "Owner manages product variants" on public.product_variants for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Public reads images for published products" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.publication_status = 'published' or public.is_active_admin())));
create policy "Owner manages product images" on public.product_images for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create policy "Public reads active promotions" on public.promotions for select to anon, authenticated using ((publication_status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())) or public.is_active_admin());
create policy "Owner inserts promotions" on public.promotions for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates promotions" on public.promotions for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Owner deletes promotions" on public.promotions for delete to authenticated using (public.is_active_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads product image files" on storage.objects for select to public using (bucket_id = 'product-images');
create policy "Owner uploads product image files" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_active_admin());
create policy "Owner updates product image files" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_active_admin()) with check (bucket_id = 'product-images' and public.is_active_admin());
create policy "Owner removes product image files" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_active_admin());
