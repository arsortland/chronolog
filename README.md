# ChronoLog

A terminal-aesthetic time tracking app for consultants. Log hours against WBS/WO codes, track billable vs. non-billable time, and review your history — all in a hacker-green-on-dark UI.

## Features

- **Dashboard** — Log time entries for today, view a current-week daily breakdown, and see a previous-week summary. Stats show hours logged today, hours this week, and your weekly billing rate.
- **History** — Browse all entries with quick-select period filters (Today, This Week, Last Week, This Month, Last Month) and a manual date range. Filterable by billed/unbilled status with summary totals.
- **Codes** — Manage your WBS/WO project codes. Give each one a customer name and code identifier that auto-populates when selected in the time entry form.
- **Auth** — Email/password sign-in, registration, and an inline forgot-password flow via Firebase Auth. Each user's data is private to their account.
- **Dark / light theme** — Toggleable, persisted to `localStorage`.

## Tech Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router) |
| Language        | TypeScript                                    |
| Styling         | Tailwind CSS v4 + CSS custom properties       |
| Font            | JetBrains Mono                                |
| Auth & Database | Firebase Auth + Firestore                     |
| Date utilities  | date-fns                                      |
| Icons           | lucide-react                                  |
| Hosting         | Vercel                                        |

## Live App

Available at **[chronologg.vercel.app](https://chronolog.vercel.app)**

## How to Use

1. **Register** — Create an account on the register page with your name, email, and password.
2. **Add codes** — Go to **Codes** and create your WBS/WO project codes. Give each one a customer name and code identifier. These will appear as options in the time entry form.
3. **Log time** — On the **Dashboard**, use the form at the top to log a time entry. Select a date, pick a project code (or use COMP for compensatory time), enter hours, and optionally add a note.
4. **Mark as billed** — Toggle the billed status on any entry once you've invoiced it.
5. **Review history** — Go to **History** to search and filter all your entries by period or date range. The summary shows total hours and your billing rate for the active filter.
