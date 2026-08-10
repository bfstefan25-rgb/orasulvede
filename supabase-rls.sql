-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- PROFILES
alter table profiles enable row level security;
create policy "Anyone can read profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- REPORTS
alter table reports enable row level security;
create policy "Anyone can read reports" on reports for select using (true);
create policy "Auth users can insert reports" on reports for insert with check (auth.uid() = user_id);
create policy "Owner can update report" on reports for update using (auth.uid() = user_id);
create policy "Owner can delete report" on reports for delete using (auth.uid() = user_id);

-- VOTES
alter table votes enable row level security;
create policy "Anyone can read votes" on votes for select using (true);
create policy "Auth users can insert votes" on votes for insert with check (auth.uid() = user_id);
create policy "Owner can delete vote" on votes for delete using (auth.uid() = user_id);

-- COMMENTS
alter table comments enable row level security;
create policy "Anyone can read comments" on comments for select using (true);
create policy "Auth users can insert comments" on comments for insert with check (auth.uid() = user_id);
create policy "Owner can delete comment" on comments for delete using (auth.uid() = user_id);

-- NOTIFICATIONS
alter table notifications enable row level security;
create policy "Users can read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
