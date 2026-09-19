-- Keep privileged email-integration mutations scoped to the current company
-- and avoid per-row auth function re-evaluation in RLS.
drop policy if exists "email_integrations_delete" on public.email_integrations;
create policy "email_integrations_delete"
on public.email_integrations
for delete
to authenticated
using (
  company_id = (select private.current_user_company_id())
  and (
    user_id = (select auth.uid())
    or (select private.current_user_role()) = 'admin'::public.user_role
  )
);

drop policy if exists "email_integrations_update" on public.email_integrations;
create policy "email_integrations_update"
on public.email_integrations
for update
to authenticated
using (
  company_id = (select private.current_user_company_id())
  and (
    user_id = (select auth.uid())
    or (select private.current_user_role()) = 'admin'::public.user_role
  )
)
with check (
  company_id = (select private.current_user_company_id())
);
