-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- Institutional Dashboard: role + sector columns
-- ============================================================

-- ROLE — gates the new /dashboard route (citizen app is unaffected;
-- reports/profiles are already public-readable, so no RLS changes
-- are needed here — this column only drives a frontend route guard).
alter table profiles add column if not exists role text not null default 'citizen';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table profiles add constraint profiles_role_check
      check (role in ('citizen', 'institution_admin'));
  end if;
end $$;

-- Grant the existing hardcoded admin (see src/pages/Admin.jsx ADMIN_ID)
-- institution_admin access so the site owner isn't locked out.
update profiles set role = 'institution_admin'
where id = '2f6ac2bd-23d3-4e70-b859-606b150d1bca';

-- SECTOR — Bucharest sector ("Sector 1".."Sector 6"), derived from
-- lat/lng via reverse geocoding. Nullable: older reports and reports
-- outside Bucharest won't have one until backfilled.
alter table reports add column if not exists sector text;
