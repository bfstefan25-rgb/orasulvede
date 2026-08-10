-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Institutional Dashboard — Priority 2: routing, assignment,
-- category correction, status history (for SLA analytics)
-- ============================================================

-- ROUTING / ASSIGNMENT
alter table reports add column if not exists assigned_department text;
alter table reports add column if not exists assigned_to text;

-- STATUS HISTORY (for SLA / time-to-route / time-to-resolve analytics)
create table if not exists status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);

-- RLS enabled, deliberately zero policies (default-deny). Nothing reads
-- this table directly from the client — the get_status_history RPC below
-- is the only read path, gated to institution_admin.
alter table status_history enable row level security;

-- Auto-log every status transition (and the initial status on insert),
-- regardless of which code path writes to `reports` — fires for the
-- existing admin_update_report RPC, admin_update_sector, the RPCs below,
-- and citizen submissions, with no changes needed to any of them.
-- Guards against no-op writes: saving a note or backfilling a sector both
-- re-send the *current* status, so we only log on INSERT or an actual
-- status change — otherwise every unrelated save would spam a fake
-- transition row.
create or replace function ov_log_report_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into status_history (report_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    insert into status_history (report_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_ov_status_history on reports;
create trigger trg_ov_status_history
after insert or update on reports
for each row execute function ov_log_report_status_change();

-- CATEGORY CORRECTION
create or replace function admin_update_category(report_id uuid, new_category text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'institution_admin') then
    raise exception 'not authorized';
  end if;
  update reports set category = new_category where id = report_id;
end;
$$;
grant execute on function admin_update_category(uuid, text) to authenticated;

-- ROUTING / ASSIGNMENT
create or replace function admin_update_routing(report_id uuid, department text, assignee text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'institution_admin') then
    raise exception 'not authorized';
  end if;
  update reports set assigned_department = department, assigned_to = assignee where id = report_id;
end;
$$;
grant execute on function admin_update_routing(uuid, text, text) to authenticated;

-- STATUS HISTORY READ (controlled path since status_history has no RLS policies)
create or replace function get_status_history(p_report_id uuid)
returns table (old_status text, new_status text, changed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'institution_admin') then
    raise exception 'not authorized';
  end if;
  return query
    select sh.old_status, sh.new_status, sh.changed_at
    from status_history sh
    where sh.report_id = p_report_id
    order by sh.changed_at asc;
end;
$$;
grant execute on function get_status_history(uuid) to authenticated;

NOTIFY pgrst, 'reload schema';
