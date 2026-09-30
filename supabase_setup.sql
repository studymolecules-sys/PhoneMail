-- PhoneMail email table and row-level security setup.
-- This script is idempotent for a fresh install or a compatible existing table.
-- Review the existing schema/policies before running against a live project.

create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  sender_address text not null,
  recipient_address text not null,
  subject text not null default '',
  body_text text not null default '',
  body_html text not null default '',
  created_at timestamptz not null default now(),
  read_status boolean not null default false
);

alter table public.emails add column if not exists sender_address text;
alter table public.emails add column if not exists recipient_address text;
alter table public.emails add column if not exists subject text not null default '';
alter table public.emails add column if not exists body_text text not null default '';
alter table public.emails add column if not exists body_html text not null default '';
alter table public.emails add column if not exists created_at timestamptz not null default now();
alter table public.emails add column if not exists read_status boolean not null default false;
alter table public.emails enable row level security;
revoke all on table public.emails from anon;
grant select, insert, update, delete on table public.emails to authenticated;

-- Remove policies from the earlier example so they cannot leave an unrestricted
-- incoming-email insert path enabled. Service-role server code bypasses RLS.
drop policy if exists "Users can view their own emails" on public.emails;
drop policy if exists "Users can send emails as themselves" on public.emails;
drop policy if exists "Allow incoming emails insert" on public.emails;
drop policy if exists "Users can update read status of received emails" on public.emails;
drop policy if exists "Users can delete their own emails" on public.emails;
drop policy if exists "PhoneMail users can read participating emails" on public.emails;
drop policy if exists "PhoneMail users can send as themselves" on public.emails;
drop policy if exists "PhoneMail users can update received emails" on public.emails;
drop policy if exists "PhoneMail users can delete participating emails" on public.emails;

create policy "PhoneMail users can read participating emails"
on public.emails for select to authenticated
using (
  sender_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
  or recipient_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
);

create policy "PhoneMail users can send as themselves"
on public.emails for insert to authenticated
with check (
  sender_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
);

create policy "PhoneMail users can update received emails"
on public.emails for update to authenticated
using (
  recipient_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
)
with check (
  recipient_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
);

create policy "PhoneMail users can delete participating emails"
on public.emails for delete to authenticated
using (
  sender_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
  or recipient_address = regexp_replace(coalesce(auth.jwt() ->> 'phone', ''), '[^0-9]', '', 'g') || '@pmail.vixiya.com'
);

create index if not exists emails_sender_created_at_idx
  on public.emails (sender_address, created_at desc);
create index if not exists emails_recipient_created_at_idx
  on public.emails (recipient_address, created_at desc);
