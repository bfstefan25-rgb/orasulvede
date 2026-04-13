# PLAN.MD — Orasul Vede

> **Instructions for Claude:** At the start of each session, read this file to understand the project state. At the end of each session, update the checklist, progress %, and Next Actions sections to reflect what was done.

---

## Project Overview

**Orasul Vede** — A civic reporting web app where citizens can report urban problems (potholes, broken lights, garbage, etc.), track their resolution, vote on reports, and earn points.

**Stack:** React 19 + Vite 8 · Supabase (auth + DB) · Tailwind CSS 3 · React Router 7 · Lucide React · Google Maps JS API

**Run locally:** `npm run dev` → http://localhost:5173

---

## Pages & Components

| File | Route | Description |
|------|-------|-------------|
| `Landing.jsx` | `/` | Public marketing page with animations |
| `Login.jsx` | `/login` | Auth - login |
| `Register.jsx` | `/register` | Auth - register |
| `Home.jsx` | `/acasa` | Report feed with filters, tabs, stats |
| `Map.jsx` | `/harta` | Interactive Google Maps with report pins |
| `Report.jsx` | `/raporteaza` | Multi-step report form (5 steps) |
| `ReportDetail.jsx` | `/raport/:id` | Report view: status stepper, votes, comments |
| `Leaderboard.jsx` | `/clasament` | Rankings, charts, stats |
| `Profile.jsx` | `/profil` | User profile, badges, levels, settings |
| `Admin.jsx` | `/admin` | Admin panel — status management |
| `Navbar.jsx` | global | Top nav (desktop) + bottom nav (mobile) |

---

## Implementation Stages

### Stage 1 — Core Infrastructure ✅
- [x] Supabase setup (auth, profiles, reports tables)
- [x] React Router with protected routes
- [x] Dark mode via SettingsContext
- [x] Mobile-first layout with bottom navigation
- [x] Navbar with logo

### Stage 2 — Authentication ✅
- [x] Login page
- [x] Register page
- [x] AuthContext with session persistence
- [x] Redirect on auth state change

### Stage 3 — Report Flow ✅
- [x] Multi-step form: Category → Location → Details → Photos → Confirm
- [x] Google Maps location picker with reverse geocoding
- [x] Image upload to Supabase storage
- [x] Category selection with icons

### Stage 4 — Feed & Map ✅
- [x] Home feed with recent/trending tabs
- [x] Category filter chips
- [x] Global stats bar (total, in lucru, rezolvate, azi)
- [x] Interactive map with report pins
- [x] Report detail page with status progress stepper
- [x] Voting system (upvotes)
- [x] Comments system

### Stage 5 — Gamification ✅
- [x] Points system (report +10, verified +15, resolved +50, vote +5)
- [x] 10-level progression system with named levels
- [x] 8 earnable badges
- [x] Rank calculation vs other users

### Stage 6 — Leaderboard & Stats ✅
- [x] Top users ranking
- [x] Top problematic streets (bar chart)
- [x] Pie chart — Probleme pe categorii
- [x] Top probleme ignorate (unresolved > 30 days)
- [x] Statistici generale banner (total, rezolvate, in lucru, rata rezolvare)

### Stage 7 — Profile ✅
- [x] Gradient banner header with avatar overlap
- [x] Member since year displayed
- [x] Colorful stats cards (blue/green/yellow/purple)
- [x] Collapsed level roadmap (current ±2, expand toggle)
- [x] Locked badge styling (dashed border + lock icon)
- [x] Settings drawer (display name, theme, toggles)
- [x] My reports list with status badges

### Stage 8 — Admin ✅
- [x] Admin-only access guard
- [x] Status flow management (raportat → in_verificare → in_lucru → rezolvat)
- [x] Reject / reset actions
- [x] Stats cards per status

---

## Progress

**Overall: ~80% complete**

```
Stage 1  [██████████] 100%
Stage 2  [██████████] 100%
Stage 3  [██████████] 100%
Stage 4  [██████████] 100%
Stage 5  [██████████] 100%
Stage 6  [██████████] 100%
Stage 7  [██████████] 100%
Stage 8  [██████████] 100%
Stage 9  [░░░░░░░░░░]   0%  ← Polish & remaining features
```

---

## Known Issues / Bugs

- [ ] Navbar logo overflow fix applied (overflow-hidden) — monitor if logo looks good on all pages
- [ ] `applyToContext` imported but unused in Profile.jsx (minor lint warning)
- [ ] Admin page uses inline styles instead of Tailwind (inconsistent with rest of app)

---

## Stage 9 — Remaining Work

### High Priority
- [ ] User avatar upload in Profile settings
- [ ] Pagination or infinite scroll on Home feed (currently loads all reports)
- [ ] Map report clustering (when many pins overlap on zoom out)
- [ ] Report owner can edit or delete their own report

### Medium Priority
- [ ] Search bar on Home feed
- [ ] Notification system (in-app: "your report was resolved")
- [ ] Landing page — connect real stats from Supabase (currently static numbers)
- [ ] Admin page — refactor from inline styles to Tailwind (consistency)
- [ ] Add `respins` status handling to ReportDetail stepper (currently hidden)

### Low Priority / Nice to Have
- [ ] Image compression before upload (large images slow submission)
- [ ] Share report button (copy link)
- [ ] Filter reports by status on Home feed
- [ ] PWA manifest + install prompt
- [ ] Email notifications for report status changes

---

## Next Actions (start here next session)

1. **User avatar upload** — add image picker + upload to Supabase storage in Profile settings drawer
2. **Pagination on Home feed** — add "Load more" button or infinite scroll
3. **Search bar** — add search input on Home page to filter reports by title/address

---

## Session Log

| Date | What was done |
|------|--------------|
| 2026-04-13 | Added pie chart to Leaderboard; added "Top probleme ignorate" + "Statistici generale" sections; Profile redesign (gradient banner, colorful stats, collapsed levels, locked badges); fixed progress stepper alignment; fixed navbar logo overflow |
