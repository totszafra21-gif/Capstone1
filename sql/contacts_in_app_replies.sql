alter table if exists public.contacts
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists admin_reply text,
add column if not exists replied_at timestamptz;
