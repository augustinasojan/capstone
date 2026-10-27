# Submission Report

Fill in the **Result** column yourself after testing. Do not tick anything you have not actually checked.

## Milestone status
| # | Milestone | Status |
| --- | --- | --- |
| 1 | Project defined | Done - `docs/PROJECT_DEFINITION.md` |
| 2 | Repository and skeleton | Done in the ZIP; **GitHub repo: add link** |
| 3 | Database and backend API | Code written; **verify against your Atlas cluster** |
| 4 | Authentication and authorization | Code written; **verify with the tests below** |
| 5 | Frontend screens | Code written (4 states on each data screen) |
| 6 | Integration | API client uses `VITE_API_URL` or `/api` |
| 7 | Testing and fixes | **Run the manual tests below and record results** |
| 8 | Deployment | **Follow `docs/SETUP_GUIDE.md` section 4** |
| 9 | Documentation and submission | README done; **add screenshots and live links** |

## Manual test script
| # | Test | Expected | Result |
| --- | --- | --- | --- |
| 1 | Register manager with valid data | Redirected to Board | |
| 2 | Register again with same email | "An account with this email already exists" | |
| 3 | Register with 5-character password | Message shown, nothing saved | |
| 4 | Sign in with wrong password | "Invalid email or password" | |
| 5 | Create project with 2-character title | Validation message | |
| 6 | Create project "Sprint 1" | Appears in list immediately | |
| 7 | Register a member (second browser or private window) | Board shows empty state for member | |
| 8 | Manager creates task assigned to the member | Task appears in To Do | |
| 9 | Member moves task To Do -> In Progress -> Review -> Done | Task moves column each time | |
| 10 | Member opens Projects, tries "+ New Project" | Button not shown; API call returns 403 | |
| 11 | Second manager cannot see first manager's projects/tasks | Empty lists | |
| 12 | Stop the API and click a move button | Friendly "Cannot reach the server" error | |
| 13 | Refresh `/board` on the live site | Page loads (no 404) | |
| 14 | Phone width (DevTools) | Columns stack, no horizontal scroll | |
| 15 | Keyboard only (Tab / Enter) | All actions reachable, focus visible | |

## Self-review questions
1. **Problem and users:** Small teams lose track of who is doing what; TaskFlow gives managers and members a shared Kanban board.
2. **MVP end to end:** Register -> create project -> create and assign task -> member moves it. *(Confirm with test script rows 1-9.)*
3. **Request trace:** Click "Move to ..." in `TaskCard` -> `Board.onMove` -> `api.updateTask` (`client/src/services/api.js`) -> `PATCH /api/tasks/:id` -> `protect` middleware verifies token -> `task.controller.update` checks ownership/assignment and validates -> Mongoose saves to MongoDB -> JSON response -> state updated and column re-renders.
4. **Bad input / offline / API failure:** Client validates first; server validates again and returns `{message}` with 400. Network failure shows "Cannot reach the server"; failed loads show an error with a Try again button; unexpected errors return a generic 500 message and are logged on the server.
5. **Data protection:** Every route except register/login needs a valid JWT. Managers only query their own projects; members only tasks assigned to them; other users' resources return 404. Role checks happen in middleware and controllers.
6. **Secrets:** `MONGODB_URI` and `JWT_SECRET` live only in environment variables (`server/.env` locally, host dashboard in production). `.env` is git-ignored; only `.env.example` files are committed. The frontend contains no secrets.
7. **Phone and keyboard:** Mobile-first CSS grid, labelled inputs, skip link, visible focus. *(Confirm with test rows 14-15.)*
8. **Clone and run:** README lists install and run commands and environment variable names. *(Ask a friend to try, or test in a fresh folder.)*
9. **Tenfold users:** First to break would be the free-tier host and database limits, then unpaginated project lists and the per-request user lookup in `protect`. Tasks are paginated and indexed; next steps would be caching, indexes review and a paid tier.
10. **Next improvements:** Invitation-based teams (so users cannot pick their own role), drag and drop, httpOnly cookie auth, automated tests, comments and notifications.

## Final checklist (tick only when true)
- [ ] GitHub repository URL shared and public (or reviewers have access)
- [ ] Hosted URL works
- [ ] README has live links and screenshots
- [ ] Sign-up, sign-in and main flow tested on the live site
- [ ] No `.env` in the repository; `.env.example` files present
- [ ] No secrets or real personal data in code or screenshots
- [ ] Known limitations listed in README (done)
