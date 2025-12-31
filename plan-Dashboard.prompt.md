## Plan: Dashboard Redesign from Scratch

Build a comprehensive user dashboard showcasing gamification, announcements, upcoming sessions, tasks, and personalized stats with a modern card-based layout.

### Steps

1. **Create Dashboard Layout** at[frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx) — Redesign with sidebar navigation (Overview, Contests, Sessions, Tasks, Leaderboard) and main content area. Add responsive grid layout with dark theme matching admin panel.

2. **Build Stats Overview Section** — Display cards for: Rank on leaderboard (`GET /gamification/leaderboard`), Total points, Badges earned (`GET /gamification/badges/me`), Contests participated, Acceptance rate calculated from submissions.

3. **Add Announcements Banner** — Fetch `GET /announcements`, show latest 2-3 as dismissible banners at top or in a dedicated card. Highlight urgent announcements.

4. **Create Sessions Panel** — List upcoming sessions (`GET /sessions`), show date/time, register button (`POST /sessions/:id/register`), indicate if already registered via `attendees` array.

5. **Build Tasks Section** — Display assigned tasks (need new endpoint `GET /tasks/me`), show title, points, due date, status. Add submit completion link button (`POST /tasks/:id/submit`).

6. **Add Leaderboard Widget** — Compact leaderboard showing top 5 users and current user's position. Link to full leaderboard page. Support period filter (month/semester/all).

7. **Create Profile Completion Card** — Show profile completeness %, prompt to add missing fields (handles, contact, branch). Link to profile edit page at [frontend/app/profile/page.tsx](frontend/app/profile/page.tsx).

### Further Considerations

1. **Task Endpoints Missing**: Backend has no `GET /tasks` or `GET /tasks/me` for listing tasks. Need to add these endpoints first?

2. **AI Chat Widget**: Add floating chat button for AI assistant (`POST /ai/chat`) or keep for a separate page?

3. **Activity Feed**: Show recent activity (submissions, badges earned, session attended) as a timeline? Could be complex to implement.
