begin;

-- The admin check only needs the caller's RLS-visible profile row.
-- SECURITY INVOKER removes an unnecessary externally callable definer function.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and active = true
  );
$$;

-- This platform event-trigger helper must never be callable over the API.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists product_options_product_idx
  on public.product_options (product_id);

-- Keep a single SELECT policy per role/action while preserving owner writes.
drop policy if exists "Owner manages product options" on public.product_options;
create policy "Owner inserts product options" on public.product_options
  for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates product options" on public.product_options
  for update to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Owner deletes product options" on public.product_options
  for delete to authenticated using (public.is_active_admin());

drop policy if exists "Owner manages product variants" on public.product_variants;
create policy "Owner inserts product variants" on public.product_variants
  for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates product variants" on public.product_variants
  for update to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Owner deletes product variants" on public.product_variants
  for delete to authenticated using (public.is_active_admin());

drop policy if exists "Owner manages product images" on public.product_images;
create policy "Owner inserts product images" on public.product_images
  for insert to authenticated with check (public.is_active_admin());
create policy "Owner updates product images" on public.product_images
  for update to authenticated
  using (public.is_active_admin()) with check (public.is_active_admin());
create policy "Owner deletes product images" on public.product_images
  for delete to authenticated using (public.is_active_admin());

commit;
