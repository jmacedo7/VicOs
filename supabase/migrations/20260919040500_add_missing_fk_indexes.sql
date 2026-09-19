create index if not exists document_versions_edited_by_idx
  on public.document_versions (edited_by);

create index if not exists documents_updated_by_idx
  on public.documents (updated_by);

create index if not exists tasks_created_by_idx
  on public.tasks (created_by);
