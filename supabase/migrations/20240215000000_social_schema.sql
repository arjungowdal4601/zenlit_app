-- Schema for social features, chats, and posts

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('normal', 'anonymous')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  inserted_at timestamptz not null default now(),
  primary key(chat_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('text', 'image', 'audio', 'system')),
  text text,
  media_url text,
  reply_to_id uuid references public.messages(id),
  status text check (status in ('sent', 'delivered', 'read')),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.profiles enable row level security;

-- Profiles policies

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles read public'
  ) then
    create policy "profiles read public" on public.profiles
      for select
      using (true);
  end if;
end $$;


do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles update own'
  ) then
    create policy "profiles update own" on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;

-- Chat membership policies

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chat_members' and policyname = 'chat_members manage self'
  ) then
    create policy "chat_members manage self" on public.chat_members
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Chats readable by members

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chats' and policyname = 'chats readable by members'
  ) then
    create policy "chats readable by members" on public.chats
      for select
      using (exists (
        select 1 from public.chat_members m where m.chat_id = id and m.user_id = auth.uid()
      ));
  end if;
end $$;

-- Messages policies

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages read by members'
  ) then
    create policy "messages read by members" on public.messages
      for select
      using (exists (
        select 1 from public.chat_members m where m.chat_id = messages.chat_id and m.user_id = auth.uid()
      ));
  end if;
end $$;


do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'messages insert own'
  ) then
    create policy "messages insert own" on public.messages
      for insert
      with check (auth.uid() = sender_id);
  end if;
end $$;

-- Posts policies

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'posts read all'
  ) then
    create policy "posts read all" on public.posts
      for select
      using (true);
  end if;
end $$;


do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'posts' and policyname = 'posts insert own'
  ) then
    create policy "posts insert own" on public.posts
      for insert
      with check (auth.uid() = author_id);
  end if;
end $$;
