create extension if not exists pgcrypto;

alter table public.companies add column if not exists join_code text;
create unique index if not exists companies_join_code_uidx on public.companies(join_code) where join_code is not null;

create or replace function private.make_join_code()
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i integer;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    end loop;
    exit when not exists (select 1 from public.companies where join_code = candidate);
  end loop;
  return candidate;
end;
$$;

update public.companies set join_code = private.make_join_code() where join_code is null;

create table if not exists public.company_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  code text not null unique,
  token_hash text not null unique,
  email text,
  role user_role not null default 'operator',
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.company_invites enable row level security;
drop policy if exists company_invites_select on public.company_invites;
create policy company_invites_select on public.company_invites for select to authenticated using (company_id = private.current_user_company_id() and private.current_user_role() in ('admin','manager'));
drop policy if exists company_invites_delete on public.company_invites;
create policy company_invites_delete on public.company_invites for delete to authenticated using (company_id = private.current_user_company_id() and private.current_user_role() = 'admin');

create or replace function public.create_company_for_current_user(p_name text)
returns jsonb language plpgsql security definer set search_path = public, private as $$
declare v_uid uuid := auth.uid(); v_email text; v_name text; v_company_id uuid; v_code text;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;
  if exists (select 1 from public.users where id = v_uid) then raise exception 'ALREADY_HAS_COMPANY'; end if;
  v_name := trim(p_name);
  if v_name is null or length(v_name) < 2 or length(v_name) > 200 then raise exception 'INVALID_COMPANY_NAME'; end if;
  select email into v_email from auth.users where id = v_uid;
  v_code := private.make_join_code();
  insert into public.companies(name, join_code) values (v_name, v_code) returning id into v_company_id;
  insert into public.users(id, company_id, name, email, role)
  values (v_uid, v_company_id, coalesce(nullif(trim((select raw_user_meta_data->>'full_name' from auth.users where id=v_uid)),''), split_part(coalesce(v_email,''),'@',1), 'Usuário'), v_email, 'admin');
  return jsonb_build_object('company_id', v_company_id, 'join_code', v_code);
end;
$$;

create or replace function public.join_company_by_code(p_code text)
returns jsonb language plpgsql security definer set search_path = public, private as $$
declare v_uid uuid := auth.uid(); v_company public.companies%rowtype; v_email text; v_name text;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;
  if exists (select 1 from public.users where id = v_uid) then raise exception 'ALREADY_HAS_COMPANY'; end if;
  select * into v_company from public.companies where upper(join_code)=upper(trim(p_code)) limit 1;
  if not found then raise exception 'INVALID_COMPANY_CODE'; end if;
  select email, coalesce(nullif(trim(raw_user_meta_data->>'full_name'),''), split_part(coalesce(email,''),'@',1), 'Usuário') into v_email, v_name from auth.users where id=v_uid;
  insert into public.users(id, company_id, name, email, role) values (v_uid, v_company.id, v_name, v_email, 'operator');
  return jsonb_build_object('company_id', v_company.id, 'company_name', v_company.name);
end;
$$;

create or replace function public.create_company_invite(p_role user_role default 'operator', p_email text default null)
returns jsonb language plpgsql security definer set search_path = public, private as $$
declare v_uid uuid := auth.uid(); v_company_id uuid; v_code text; v_token text;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;
  select company_id into v_company_id from public.users where id=v_uid and role in ('admin','manager');
  if v_company_id is null then raise exception 'FORBIDDEN'; end if;
  v_code := private.make_join_code(); v_token := encode(gen_random_bytes(32), 'hex');
  insert into public.company_invites(company_id, created_by, code, token_hash, email, role) values (v_company_id, v_uid, v_code, encode(digest(v_token,'sha256'),'hex'), nullif(lower(trim(p_email)),''), p_role);
  return jsonb_build_object('code', v_code, 'token', v_token, 'company_id', v_company_id);
end;
$$;

create or replace function public.join_company_by_invite(p_token text)
returns jsonb language plpgsql security definer set search_path = public, private as $$
declare v_uid uuid := auth.uid(); v_invite public.company_invites%rowtype; v_email text; v_name text;
begin
  if v_uid is null then raise exception 'UNAUTHORIZED'; end if;
  if exists (select 1 from public.users where id = v_uid) then raise exception 'ALREADY_HAS_COMPANY'; end if;
  select * into v_invite from public.company_invites where token_hash = encode(digest(p_token,'sha256'),'hex') and used_at is null and expires_at > now() for update;
  if not found then raise exception 'INVALID_OR_EXPIRED_INVITE'; end if;
  select email, coalesce(nullif(trim(raw_user_meta_data->>'full_name'),''), split_part(coalesce(email,''),'@',1), 'Usuário') into v_email, v_name from auth.users where id=v_uid;
  if v_invite.email is not null and lower(v_invite.email) <> lower(coalesce(v_email,'')) then raise exception 'INVITE_EMAIL_MISMATCH'; end if;
  insert into public.users(id, company_id, name, email, role) values (v_uid, v_invite.company_id, v_name, v_email, v_invite.role);
  update public.company_invites set used_at=now() where id=v_invite.id;
  return jsonb_build_object('company_id', v_invite.company_id);
end;
$$;

revoke all on function public.create_company_for_current_user(text) from public;
grant execute on function public.create_company_for_current_user(text) to authenticated;
revoke all on function public.join_company_by_code(text) from public;
grant execute on function public.join_company_by_code(text) to authenticated;
revoke all on function public.create_company_invite(user_role,text) from public;
grant execute on function public.create_company_invite(user_role,text) to authenticated;
revoke all on function public.join_company_by_invite(text) from public;
grant execute on function public.join_company_by_invite(text) to authenticated;
