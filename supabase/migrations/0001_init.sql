-- NOCTIVA initial schema. Run in Supabase SQL editor (or `supabase db push`).
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------- Tables ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wallpapers (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  slug text not null unique,
  description text check (char_length(description) <= 2000),
  category_id uuid references public.categories(id) on delete set null,
  thumbnail_key text,            -- key in PUBLIC bucket
  preview_key text,              -- optional short clip in PUBLIC bucket
  resolution text,               -- e.g. 3840x2160
  frame_rate numeric(6,2),
  format text not null default 'mp4',
  file_size bigint not null default 0,   -- size of original, bytes
  tags text[] not null default '{}',
  source_type text not null default 'upload' check (source_type in ('upload','instagram')),
  instagram_source_url text,
  published boolean not null default false,
  featured boolean not null default false,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallpaper_files (
  id uuid primary key default gen_random_uuid(),
  wallpaper_id uuid not null references public.wallpapers(id) on delete cascade,
  label text not null check (label in ('Original','4K','2K','1080p','720p')),
  resolution text,
  storage_key text not null,      -- key in PRIVATE bucket
  file_size bigint not null default 0,
  created_at timestamptz not null default now(),
  unique (wallpaper_id, label)
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  wallpaper_id uuid not null references public.wallpapers(id) on delete cascade,
  resolution text,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index wallpapers_pub_created_idx on public.wallpapers (published, created_at desc);
create index wallpapers_pub_popular_idx on public.wallpapers (published, download_count desc);
create index wallpapers_category_idx on public.wallpapers (category_id);
create index wallpapers_title_trgm_idx on public.wallpapers using gin (title gin_trgm_ops);
create index wallpaper_files_wallpaper_idx on public.wallpaper_files (wallpaper_id);
create index downloads_wallpaper_idx on public.downloads (wallpaper_id, created_at desc);
create index downloads_dedupe_idx on public.downloads (ip_hash, wallpaper_id, created_at desc);

-- ---------- Helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger wallpapers_touch before update on public.wallpapers
for each row execute function public.touch_updated_at();

create or replace function public.increment_download(wid uuid) returns void
language sql security definer set search_path = public as $$
  update public.wallpapers set download_count = download_count + 1 where id = wid;
$$;
revoke all on function public.increment_download(uuid) from public, anon, authenticated;
grant execute on function public.increment_download(uuid) to service_role;

-- ---------- Row Level Security ----------
alter table public.categories enable row level security;
alter table public.admin_users enable row level security;
alter table public.wallpapers enable row level security;
alter table public.wallpaper_files enable row level security;
alter table public.downloads enable row level security;

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_users self read" on public.admin_users for select using (user_id = auth.uid());

create policy "wallpapers public read published" on public.wallpapers for select
  using (published or public.is_admin());
create policy "wallpapers admin write" on public.wallpapers for all
  using (public.is_admin()) with check (public.is_admin());

create policy "files public read published" on public.wallpaper_files for select
  using (exists (select 1 from public.wallpapers w where w.id = wallpaper_id and (w.published or public.is_admin())));
create policy "files admin write" on public.wallpaper_files for all
  using (public.is_admin()) with check (public.is_admin());

-- downloads: inserted only by the server (service role bypasses RLS); admins can read
create policy "downloads admin read" on public.downloads for select using (public.is_admin());

-- ---------- Seed categories ----------
insert into public.categories (name_en, name_ar, slug) values
  ('Anime','أنمي','anime'),
  ('Dark Anime','أنمي مظلم','dark-anime'),
  ('Moon & Night','القمر والليل','moon-night'),
  ('Nature','طبيعة','nature'),
  ('Cinematic','سينمائي','cinematic'),
  ('Fantasy','خيال','fantasy'),
  ('Minimal','بسيط','minimal'),
  ('Other','أخرى','other')
on conflict (slug) do nothing;

-- After creating your admin user in Supabase Auth, run (replace the email):
-- insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';
