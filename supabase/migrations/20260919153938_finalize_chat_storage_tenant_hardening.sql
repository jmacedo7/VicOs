-- Final tenant/security hardening for chat key envelopes, conversation tenancy,
-- and company asset writes.

create or replace function private.prevent_conversation_company_change()
returns trigger
language plpgsql
set search_path = private, public, pg_temp
as $$
begin
  if new.company_id is distinct from old.company_id then
    raise exception 'CONVERSATION_COMPANY_IMMUTABLE' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists conversations_company_immutable on public.conversations;
create trigger conversations_company_immutable
before update of company_id on public.conversations
for each row
execute function private.prevent_conversation_company_change();

drop policy if exists conversations_update on public.conversations;
create policy conversations_update
on public.conversations
for update to authenticated
using (
  private.is_company_member(company_id)
  and private.is_conversation_member(id)
)
with check (
  company_id = (
    select c.company_id
    from public.conversations c
    where c.id = conversations.id
  )
  and private.is_company_member(company_id)
);

drop policy if exists envelopes_insert on public.conversation_key_envelopes;
create policy envelopes_insert
on public.conversation_key_envelopes
for insert to authenticated
with check (
  private.is_conversation_member(conversation_id)
  and exists (
    select 1
    from public.device_keys dk
    join public.conversation_members cm
      on cm.user_id = dk.user_id
     and cm.conversation_id = conversation_key_envelopes.conversation_id
    join public.conversations c
      on c.id = cm.conversation_id
    join public.users u
      on u.id = dk.user_id
     and u.company_id = c.company_id
    where dk.id = conversation_key_envelopes.device_key_id
  )
);

drop policy if exists envelopes_update on public.conversation_key_envelopes;
create policy envelopes_update
on public.conversation_key_envelopes
for update to authenticated
using (
  exists (
    select 1
    from public.device_keys dk
    join public.conversation_members cm
      on cm.user_id = dk.user_id
     and cm.conversation_id = conversation_key_envelopes.conversation_id
    join public.conversations c
      on c.id = cm.conversation_id
    join public.users u
      on u.id = dk.user_id
     and u.company_id = c.company_id
    where dk.id = conversation_key_envelopes.device_key_id
      and dk.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.device_keys dk
    join public.conversation_members cm
      on cm.user_id = dk.user_id
     and cm.conversation_id = conversation_key_envelopes.conversation_id
    join public.conversations c
      on c.id = cm.conversation_id
    join public.users u
      on u.id = dk.user_id
     and u.company_id = c.company_id
    where dk.id = conversation_key_envelopes.device_key_id
      and dk.user_id = (select auth.uid())
  )
);

drop policy if exists company_assets_insert on storage.objects;
create policy company_assets_insert
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] in (
    select u.company_id::text
    from public.users u
    where u.id = (select auth.uid())
  )
  and private.current_user_role() in ('admin','manager')
);

drop policy if exists company_assets_update on storage.objects;
create policy company_assets_update
on storage.objects
for update to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] in (
    select u.company_id::text
    from public.users u
    where u.id = (select auth.uid())
  )
  and private.current_user_role() in ('admin','manager')
)
with check (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] in (
    select u.company_id::text
    from public.users u
    where u.id = (select auth.uid())
  )
  and private.current_user_role() in ('admin','manager')
);

drop policy if exists company_assets_delete on storage.objects;
create policy company_assets_delete
on storage.objects
for delete to authenticated
using (
  bucket_id = 'company-assets'
  and (storage.foldername(name))[1] in (
    select u.company_id::text
    from public.users u
    where u.id = (select auth.uid())
  )
  and private.current_user_role() in ('admin','manager')
);

revoke execute on function private.prevent_conversation_company_change() from public, anon, authenticated;
