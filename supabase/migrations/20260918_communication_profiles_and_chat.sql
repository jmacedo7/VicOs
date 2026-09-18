-- VicOs communication, profiles, company customization and encrypted private chat.
-- Applied to the connected Supabase project on 2026-09-18.

alter table public.companies
  add column if not exists description text,
  add column if not exists industry text,
  add column if not exists theme_primary text default '#2563eb',
  add column if not exists theme_secondary text default '#0f172a',
  add column if not exists chat_enabled boolean not null default true,
  add column if not exists chat_allow_attachments boolean not null default false,
  add column if not exists chat_retention_days integer not null default 0;

alter table public.users
  add column if not exists avatar_url text,
  add column if not exists job_title text,
  add column if not exists bio text,
  add column if not exists presence text default 'offline',
  add column if not exists last_seen_at timestamptz;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id,user_id)
);

create table if not exists public.device_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  device_label text,
  public_key text not null,
  algorithm text not null default 'ECDH-P256',
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique(user_id,public_key)
);

create table if not exists public.conversation_key_envelopes (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  device_key_id uuid not null references public.device_keys(id) on delete cascade,
  sender_device_key_id uuid references public.device_keys(id) on delete cascade,
  encrypted_key text not null,
  iv text not null,
  created_at timestamptz not null default now(),
  primary key(conversation_id,device_key_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete restrict,
  ciphertext text not null,
  iv text not null,
  message_version smallint not null default 1,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create index if not exists conversations_company_last_message_idx on public.conversations(company_id,last_message_at desc);
create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id,conversation_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id,created_at desc);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists device_keys_user_idx on public.device_keys(user_id,last_seen_at desc);
create index if not exists conversation_key_envelopes_device_idx on public.conversation_key_envelopes(device_key_id,conversation_id);
create index if not exists conversation_key_envelopes_sender_device_idx on public.conversation_key_envelopes(sender_device_key_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.device_keys enable row level security;
alter table public.conversation_key_envelopes enable row level security;
alter table public.messages enable row level security;

-- Private helper functions live outside the exposed public API schema.
create or replace function private.is_company_member(target_company uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.users where id=auth.uid() and company_id=target_company) $$;
revoke all on function private.is_company_member(uuid) from public;
grant execute on function private.is_company_member(uuid) to authenticated;

create or replace function private.is_conversation_member(target_conversation uuid,target_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.conversation_members where conversation_id=target_conversation and user_id=target_user) $$;
revoke all on function private.is_conversation_member(uuid,uuid) from public;
grant execute on function private.is_conversation_member(uuid,uuid) to authenticated;

create policy conversations_select on public.conversations for select to authenticated using (private.is_company_member(company_id) and private.is_conversation_member(id));
create policy conversations_insert on public.conversations for insert to authenticated with check (private.is_company_member(company_id) and created_by=(select auth.uid()));
create policy conversations_update on public.conversations for update to authenticated using (private.is_company_member(company_id) and private.is_conversation_member(id)) with check (private.is_company_member(company_id));

create policy conversation_members_select on public.conversation_members for select to authenticated using (private.is_conversation_member(conversation_id));
create policy conversation_members_insert on public.conversation_members for insert to authenticated with check (
  exists(select 1 from public.conversations c where c.id=conversation_id and private.is_company_member(c.company_id) and c.created_by=(select auth.uid()))
  or (user_id=(select auth.uid()) and exists(select 1 from public.conversations c where c.id=conversation_id and private.is_company_member(c.company_id)))
);
create policy conversation_members_update on public.conversation_members for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));

create policy device_keys_select on public.device_keys for select to authenticated using (
  user_id=(select auth.uid()) or exists(
    select 1 from public.users me join public.users owner on owner.company_id=me.company_id
    where me.id=(select auth.uid()) and owner.id=device_keys.user_id
  )
);
create policy device_keys_insert on public.device_keys for insert to authenticated with check (user_id=(select auth.uid()));
create policy device_keys_update on public.device_keys for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy device_keys_delete on public.device_keys for delete to authenticated using (user_id=(select auth.uid()));

create policy envelopes_select on public.conversation_key_envelopes for select to authenticated using (private.is_conversation_member(conversation_id));
create policy envelopes_insert on public.conversation_key_envelopes for insert to authenticated with check (private.is_conversation_member(conversation_id) and exists(select 1 from public.device_keys dk where dk.id=device_key_id));
create policy envelopes_update on public.conversation_key_envelopes for update to authenticated using (exists(select 1 from public.device_keys dk where dk.id=device_key_id and dk.user_id=(select auth.uid())));

create policy messages_select on public.messages for select to authenticated using (private.is_conversation_member(conversation_id));
create policy messages_insert on public.messages for insert to authenticated with check (sender_id=(select auth.uid()) and private.is_conversation_member(conversation_id));
create policy messages_update on public.messages for update to authenticated using (sender_id=(select auth.uid())) with check (sender_id=(select auth.uid()));
create policy messages_delete on public.messages for delete to authenticated using (sender_id=(select auth.uid()));

create policy "users update own profile" on public.users for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_members;

create or replace function private.update_last_message_at()
returns trigger language plpgsql security definer set search_path=public
as $$ begin update public.conversations set last_message_at=NEW.created_at where id=NEW.conversation_id; return NEW; end; $$;
drop trigger if exists messages_update_conversation on public.messages;
create trigger messages_update_conversation after insert on public.messages for each row execute function private.update_last_message_at();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('company-assets','company-assets',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/png','image/jpeg','image/webp'];

drop policy if exists company_assets_select on storage.objects;
create policy company_assets_select on storage.objects for select to authenticated
using (bucket_id='company-assets' and (storage.foldername(name))[1] in (select company_id::text from public.users where id=auth.uid()));
drop policy if exists company_assets_insert on storage.objects;
create policy company_assets_insert on storage.objects for insert to authenticated
with check (bucket_id='company-assets' and (storage.foldername(name))[1] in (select company_id::text from public.users where id=auth.uid()));
drop policy if exists company_assets_update on storage.objects;
create policy company_assets_update on storage.objects for update to authenticated
using (bucket_id='company-assets' and (storage.foldername(name))[1] in (select company_id::text from public.users where id=auth.uid()));
drop policy if exists company_assets_delete on storage.objects;
create policy company_assets_delete on storage.objects for delete to authenticated
using (bucket_id='company-assets' and (storage.foldername(name))[1] in (select company_id::text from public.users where id=auth.uid()));
