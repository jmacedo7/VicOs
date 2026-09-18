-- VicOs workspace: documents, version history, tasks and email OAuth connections.

create table if not exists public.email_integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null check (provider in ('google','microsoft')),
  email text not null,
  scope text,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected','expired','error','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_integrations_user_provider_email_uidx
  on public.email_integrations(user_id, provider, email);
create index if not exists email_integrations_company_idx
  on public.email_integrations(company_id, updated_at desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  title text not null,
  content text not null default '',
  version integer not null default 1 check (version > 0),
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists documents_company_updated_idx on public.documents(company_id, updated_at desc);
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null,
  title text not null,
  content text not null,
  edited_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(document_id, version)
);
create index if not exists document_versions_document_created_idx on public.document_versions(document_id, created_at desc);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  assignee_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_company_updated_idx on public.tasks(company_id, updated_at desc);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id, status, due_date);

alter table public.email_integrations enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.tasks enable row level security;

drop policy if exists email_integrations_select on public.email_integrations;
create policy email_integrations_select on public.email_integrations for select to authenticated
using (company_id in (select private.user_company_ids()));

drop policy if exists email_integrations_insert on public.email_integrations;
create policy email_integrations_insert on public.email_integrations for insert to authenticated
with check (user_id = (select auth.uid()) and company_id = (select private.current_user_company_id()));

drop policy if exists email_integrations_update on public.email_integrations;
create policy email_integrations_update on public.email_integrations for update to authenticated
using (user_id = (select auth.uid()) or private.current_user_role() = 'admin')
with check (company_id in (select private.user_company_ids()));

drop policy if exists email_integrations_delete on public.email_integrations;
create policy email_integrations_delete on public.email_integrations for delete to authenticated
using (user_id = (select auth.uid()) or private.current_user_role() = 'admin');

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated
using (company_id in (select private.user_company_ids()) and archived_at is null);

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated
with check (company_id = (select private.current_user_company_id()) and created_by = (select auth.uid()) and private.current_user_role() <> 'viewer');

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents for update to authenticated
using (company_id in (select private.user_company_ids()) and private.current_user_role() <> 'viewer')
with check (company_id in (select private.user_company_ids()) and private.current_user_role() <> 'viewer');

drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete to authenticated
using (company_id in (select private.user_company_ids()) and private.current_user_role() in ('admin','manager'));

drop policy if exists document_versions_select on public.document_versions;
create policy document_versions_select on public.document_versions for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_versions.document_id and d.company_id in (select private.user_company_ids())));

revoke insert, update, delete on public.document_versions from authenticated, anon;

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks for select to authenticated
using (company_id in (select private.user_company_ids()));

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks for insert to authenticated
with check (
  company_id = (select private.current_user_company_id())
  and created_by = (select auth.uid())
  and private.current_user_role() <> 'viewer'
  and (
    assignee_id is null
    or exists (select 1 from public.users u where u.id = tasks.assignee_id and u.company_id = tasks.company_id)
  )
);

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks for update to authenticated
using (company_id in (select private.user_company_ids()) and private.current_user_role() <> 'viewer')
with check (
  company_id in (select private.user_company_ids())
  and private.current_user_role() <> 'viewer'
  and (
    assignee_id is null
    or exists (select 1 from public.users u where u.id = tasks.assignee_id and u.company_id = tasks.company_id)
  )
);

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks for delete to authenticated
using (company_id in (select private.user_company_ids()) and (created_by = (select auth.uid()) or private.current_user_role() in ('admin','manager')));

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function private.set_updated_at();
drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function private.set_updated_at();
drop trigger if exists email_integrations_set_updated_at on public.email_integrations;
create trigger email_integrations_set_updated_at before update on public.email_integrations for each row execute function private.set_updated_at();

create or replace function private.capture_document_version()
returns trigger language plpgsql security definer set search_path=public
as $function$
begin
  if tg_op = 'INSERT' then
    insert into public.document_versions(document_id,version,title,content,edited_by)
    values(new.id,new.version,new.title,new.content,new.updated_by)
    on conflict (document_id,version) do nothing;
    return new;
  end if;

  if tg_op = 'UPDATE' and (old.title is distinct from new.title or old.content is distinct from new.content) then
    new.version := old.version + 1;
    insert into public.document_versions(document_id,version,title,content,edited_by)
    values(new.id,new.version,new.title,new.content,new.updated_by)
    on conflict (document_id,version) do nothing;
  end if;

  return new;
end;
$function$;

revoke all on function private.capture_document_version() from public, anon;
grant execute on function private.capture_document_version() to authenticated;

drop trigger if exists documents_capture_version on public.documents;
create trigger documents_capture_version before insert or update on public.documents for each row execute function private.capture_document_version();

alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.document_versions;
alter publication supabase_realtime add table public.tasks;
