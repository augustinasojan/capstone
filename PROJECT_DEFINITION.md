# TaskFlow - Project Definition (Milestone 1)

## Problem statement
Small teams track work in chats and spreadsheets, so it is unclear who is doing what and what stage each piece of work is in.

## Target users and roles
| Role | Can do |
| --- | --- |
| Project Manager | Create/delete own projects; create, edit, assign and delete tasks in own projects; see all tasks in own projects |
| Team Member | See only tasks assigned to them; move those tasks between statuses |

## MVP scope
**Must have:** register/login, roles, projects, tasks with priority/assignee/due date, Kanban board with 4 statuses, loading/empty/error states.
**Later:** drag and drop, comments, notifications, teams/invitations, search, password reset.

## User stories and acceptance criteria
1. *As a manager, I want to create a project so that I can group tasks.*
   - Title (3-100 chars) required; empty/short title shows a message and nothing is saved.
   - The new project appears in the list without a refresh.
2. *As a manager, I want to create a task and assign it so that work has an owner.*
   - Project and title required; assignee must be an existing team member.
   - A manager cannot create tasks in another manager's project.
3. *As a member, I want to move my tasks across the board so that progress is visible.*
   - Member sees only own assigned tasks; can change status only; cannot edit other fields.
   - Moving a task updates the column immediately; on failure an error is shown.
4. *As any user, I want my data protected so that others cannot see it.*
   - Passwords are hashed; protected routes need a valid token; ownership is checked on the server.

## Data model
- **User**: name, email (unique), password (bcrypt hash), role (`manager` | `member`), timestamps
- **Project**: title, description, targetDate, owner -> User, timestamps
- **Task**: title, description, project -> Project, assignee -> User, createdBy -> User, status (`todo` | `in_progress` | `review` | `done`), priority (`low` | `medium` | `high` | `urgent`), dueDate, timestamps

Tasks **reference** projects and users (they change independently and are queried on their own) rather than being embedded.

```
User 1 ---- * Project (owner)
Project 1 ---- * Task
User 1 ---- * Task (assignee)
```

## API contract
See the table in `README.md`. Errors always return `{ "message": "..." }` with status 400 (invalid input), 401 (not signed in), 403 (not allowed), 404 (not found), 409 (duplicate email) or 500 (generic).

## Wireframes (text)
- **Sign in / Register**: centred card with form and link to the other page.
- **Board**: top bar (Board, Projects, user, Sign out); header with project filter and "+ Create Task"; four columns (stacked on mobile, 2 on tablet, 4 on desktop) containing task cards with Move buttons.
- **Projects**: header with "+ New Project"; list of project cards.

## Non-functional needs
- Passwords hashed (bcrypt, 10 rounds); tokens expire after 7 days.
- All input validated on the server; request keys starting with `$` or containing `.` are rejected.
- Sign-in/registration limited to 50 requests per 15 minutes per IP.
- Works on mobile widths, keyboard navigable, visible focus, labelled inputs.
