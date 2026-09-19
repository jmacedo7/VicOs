do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='companies') then
    alter publication supabase_realtime add table public.companies;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='contacts') then
    alter publication supabase_realtime add table public.contacts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='tags') then
    alter publication supabase_realtime add table public.tags;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='contact_tags') then
    alter publication supabase_realtime add table public.contact_tags;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='accounts') then
    alter publication supabase_realtime add table public.accounts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='account_contacts') then
    alter publication supabase_realtime add table public.account_contacts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='incomes') then
    alter publication supabase_realtime add table public.incomes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='expenses') then
    alter publication supabase_realtime add table public.expenses;
  end if;
end $$;
