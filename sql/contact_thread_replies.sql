create table if not exists public.contact_replies (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_replies enable row level security;

create policy "contact_replies_select_own_or_admin"
on public.contact_replies
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.id = contact_replies.contact_id
      and (
        contacts.user_id = auth.uid()
        or exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.is_admin = true
        )
      )
  )
);

create policy "contact_replies_insert_user_or_admin"
on public.contact_replies
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    (
      sender = 'user'
      and exists (
        select 1
        from public.contacts
        where contacts.id = contact_replies.contact_id
          and contacts.user_id = auth.uid()
      )
    )
    or (
      sender = 'admin'
      and exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.is_admin = true
      )
    )
  )
);
