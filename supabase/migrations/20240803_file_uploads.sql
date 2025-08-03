-- Create storage buckets for attachments and avatars
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Metadata table for uploaded files
create table if not exists public."FileUploads" (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  task_id uuid references public."Tasks" (id),
  project_id uuid references public."Projects" (id),
  workspace_id uuid references public."Workspaces" (id),
  file_url text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc', now())
);
