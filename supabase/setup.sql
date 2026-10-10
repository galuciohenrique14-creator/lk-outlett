create table if not exists public.products (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Public can read products" on public.products;
drop policy if exists "LK Outlet owner can manage products" on public.products;
drop policy if exists "Only owner can insert products" on public.products;
drop policy if exists "Only owner can update products" on public.products;
drop policy if exists "Only owner can delete products" on public.products;

create policy "Public can read products"
  on public.products for select to anon, authenticated
  using (true);

create policy "LK Outlet owner can manage products"
  on public.products for all to authenticated
  using (
    (select auth.jwt() ->> 'email') = 'galuciohenrique14@gmail.com'
  )
  with check (
    (select auth.jwt() ->> 'email') = 'galuciohenrique14@gmail.com'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "LK Outlet owner can manage product images" on storage.objects;

create policy "Public can view product images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "LK Outlet owner can manage product images"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'galuciohenrique14@gmail.com'
  )
  with check (
    bucket_id = 'product-images'
    and (select auth.jwt() ->> 'email') = 'galuciohenrique14@gmail.com'
  );
