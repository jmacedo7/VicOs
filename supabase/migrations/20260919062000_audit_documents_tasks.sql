-- Keep the audit history complete for core work-management records.
drop trigger if exists documents_audit on public.documents;
create trigger documents_audit
after insert or update or delete on public.documents
for each row execute function private.write_audit_log();

drop trigger if exists tasks_audit on public.tasks;
create trigger tasks_audit
after insert or update or delete on public.tasks
for each row execute function private.write_audit_log();
