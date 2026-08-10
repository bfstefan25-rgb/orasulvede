-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Institutional Dashboard: admin delete-any-report RPC
--
-- The "Owner can delete report" RLS policy on `reports` only lets a
-- report's original author delete it — same restriction that already
-- blocked the sector backfill and routing updates earlier. This RPC
-- bypasses RLS (SECURITY DEFINER, same role-gated pattern as the other
-- admin_* functions) but re-checks authorization itself.
--
-- It also explicitly cleans up votes/comments/notifications so deleting
-- a report can't fail on a foreign-key violation if those tables don't
-- cascade, and decrements profiles.reports_count/resolved_count itself —
-- deleting via Table Editor previously left those counters stale because
-- nothing decremented them; this closes that gap for this delete path.
-- ============================================================

create or replace function admin_delete_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_status text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'institution_admin') then
    raise exception 'not authorized';
  end if;

  select user_id, status into v_user_id, v_status from reports where id = p_report_id;
  if v_user_id is null then
    return; -- already gone
  end if;

  delete from votes where report_id = p_report_id;
  delete from comments where report_id = p_report_id;
  delete from notifications where report_id = p_report_id;
  delete from reports where id = p_report_id;

  update profiles
  set reports_count = greatest(0, coalesce(reports_count, 0) - 1),
      resolved_count = greatest(0, coalesce(resolved_count, 0) - (case when v_status = 'rezolvat' then 1 else 0 end))
  where id = v_user_id;
end;
$$;

grant execute on function admin_delete_report(uuid) to authenticated;

NOTIFY pgrst, 'reload schema';
