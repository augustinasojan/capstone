# TaskFlow

A project and task manager with a Kanban board. Project Managers create projects and tasks and assign them to team members; team members move their assigned tasks across the board (To Do, In Progress, Review, Done).

Built with the MERN stack: **MongoDB** (Atlas), **Express**, **React** (Vite) and **Node.js**.

## Live links

- Hosted application: `ADD YOUR LIVE URL HERE`
- GitHub repository: `ADD YOUR REPOSITORY URL HERE`

## Features

- Register and sign in (JWT authentication, passwords hashed with bcrypt)
- Two roles: **Project Manager** and **Team Member** (role-based authorization on the server)
- Managers: create and delete projects, create/edit/delete tasks, assign tasks to members
- Members: see only tasks assigned to them and move them across columns
- Kanban board with filtering by project
- Every screen handles Loading, Success, Empty and Error states
- Responsive layout, keyboard accessible, labelled forms

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Vite, plain CSS |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas |
| Security | bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit, input validation and NoSQL-operator sanitising |

## Project structure

```
taskflow-mern/
  client/                React app
    src/components/      reusable UI (Navbar, TaskCard, Spinner, ErrorBox)
    src/pages/           Login, Register, Board, Projects
    src/services/api.js  the only place that calls the backend
    src/context/         AuthContext (logged-in user)
  server/                Express API
    src/routes/          URL + method mapping only
    src/controllers/     request handling logic
    src/models/          Mongoose schemas (User, Project, Task)
    src/middleware/      auth, error handling, sanitising
    src/config/db.js     database connection
  docs/                  project definition, setup guide, submission report
```

## Run it locally

Requirements: Node.js 18 or newer, and a MongoDB Atlas connection string (see `docs/SETUP_GUIDE.md`).

```bash
# 1. install everything
npm run install-all

# 2. configure the API
cp server/.env.example server/.env      # Windows PowerShell: copy server\.env.example server\.env
# open server/.env and set MONGODB_URI and JWT_SECRET

# 3. start the API (terminal 1) -> http://localhost:5000
npm run dev:server

# 4. start the React app (terminal 2) -> http://localhost:5173
npm run dev:client
```

## Environment variables

`server/.env` (see `server/.env.example`):

| Name | Purpose |
| --- | --- |
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string including the `taskflow` database name |
| `JWT_SECRET` | Long random secret used to sign tokens |
| `CLIENT_ORIGIN` | Allowed frontend origin(s), comma separated (only needed when the frontend is hosted separately) |

`client/.env` (optional, see `client/.env.example`): `VITE_API_URL` - only if the API is hosted on a different address.

## API summary

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | public | Create an account |
| `POST /api/auth/login` | public | Sign in, returns a token |
| `GET /api/auth/me` | signed in | Current user |
| `GET /api/projects` | signed in | Own projects (manager) or projects with assigned tasks (member) |
| `POST /api/projects` | manager | Create a project |
| `PATCH /api/projects/:id` | manager (owner) | Update a project |
| `DELETE /api/projects/:id` | manager (owner) | Delete a project and its tasks |
| `GET /api/tasks?projectId=&page=&limit=` | signed in | Tasks visible to the user, paginated |
| `POST /api/tasks` | manager | Create a task |
| `PATCH /api/tasks/:id` | manager (owner) or assigned member | Managers: any field. Members: status only |
| `DELETE /api/tasks/:id` | manager (owner) | Delete a task |
| `GET /api/users` | manager | List team members (for assigning) |

## Deployment

One service serves both the API and the built React app. Steps are in `docs/SETUP_GUIDE.md`.

## Screenshots

Add screenshots of the sign-in page, Projects page, Board (desktop) and Board (mobile) here before submitting.

## Known limitations and future improvements

- Users choose their own role when registering (fine for a demo; a real system would have managers invite members).
- Any registered member appears in the assignee list of every manager (no teams or workspaces yet).
- Tasks move with buttons, not drag and drop.
- No automated test suite; testing was manual (see `docs/SUBMISSION_REPORT.md`).
- The token is stored in `localStorage`, which is simple but readable by scripts on the page; httpOnly cookies would be safer.
- No password reset or email verification.
- Free hosting tiers can sleep, so the first request after idle time may be slow.
