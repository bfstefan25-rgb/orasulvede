-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Institutional Dashboard: sector-backfill RPC
--
-- The "Owner can update report" RLS policy on `reports` only lets a
-- report's original author update it — it silently blocks the dashboard's
-- sector-backfill button from writing `sector` on reports it doesn't own.
-- This RPC (SECURITY DEFINER, same established pattern as the existing
-- admin_update_report RPC) bypasses RLS but re-checks authorization itself
-- via profiles.role, so only institution_admin accounts can use it.
-- ============================================================

create or replace function admin_update_sector(report_id uuid, new_sector text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'institution_admin'
  ) then
    raise exception 'not authorized';
  end if;

  update reports set sector = new_sector where id = report_id;
end;
$$;

grant execute on function admin_update_sector(uuid, text) to authenticated;
