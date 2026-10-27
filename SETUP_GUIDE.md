# Setup guide: MongoDB Atlas, running locally, GitHub, and deployment

## 1. MongoDB Atlas (free database)
1. Go to https://www.mongodb.com/cloud/atlas and sign in or sign up.
2. Create a free **M0** cluster (any region near you).
3. **Database Access** -> Add New Database User -> choose a username and password (use letters and numbers only to avoid encoding problems). Role: *Read and write to any database*. Save the password somewhere safe.
4. **Network Access** -> Add IP Address -> **Allow access from anywhere** (`0.0.0.0/0`). This is needed so your hosting provider can connect. (For a real product you would restrict this.)
5. **Database** -> Connect -> Drivers -> copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `USER` and `PASSWORD`, and add the database name `taskflow` before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority`
   This is your `MONGODB_URI`. The collections are created automatically on first use.

## 2. Run locally
1. Install Node.js LTS from https://nodejs.org (if `node -v` fails in PowerShell).
2. Unzip the project, open PowerShell in the project folder.
3. `npm run install-all`
4. `copy server\.env.example server\.env`, then open `server\.env` in Notepad and set:
   - `MONGODB_URI` = your string from step 1
   - `JWT_SECRET` = run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the result
5. Terminal 1: `npm run dev:server`. You should see `MongoDB connected` and `API listening on port 5000`.
6. Terminal 2: `npm run dev:client`, then open http://localhost:5173.

If the API says it cannot connect: check the password, check Network Access, and make sure the URI contains `/taskflow?`.

## 3. Put the code on GitHub (no VS Code or Git needed)
1. Sign in at https://github.com (create a free account if needed).
2. Click **+** (top right) -> **New repository**. Name: `taskflow-mern`. Choose **Public**. Click **Create repository**.
3. On the new repository page click **uploading an existing file**.
4. Unzip the project on your computer. Open the unzipped `taskflow-mern` folder and **select everything inside it** (client, server, docs, README.md, package.json, .gitignore) and drag it into the browser page. Make sure there is no `node_modules` folder and no `.env` file.
5. Scroll down, write a commit message such as `Initial commit: TaskFlow MERN app`, click **Commit changes**.
6. Your repository link is `https://github.com/YOUR_USERNAME/taskflow-mern`. Put it in `README.md` (use the pencil icon on GitHub to edit it).

Tip: browsers limit one upload to 100 files. If it complains, upload `client`, `server` and the root files in separate batches (use **Add file -> Upload files** again).

## 4. Deploy (one service for API + website) on Render
1. Sign in at https://render.com with your GitHub account.
2. **New** -> **Web Service** -> pick your `taskflow-mern` repository.
3. Settings:
   - Runtime: **Node**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Instance type: Free
4. **Environment** variables (add in the dashboard, never in the repo):
   - `MONGODB_URI` = your Atlas string
   - `JWT_SECRET` = a long random string
   - `NODE_ENV` = `production`
5. Click **Create Web Service**. When the deploy finishes you get an `https://....onrender.com` address. Open it: the sign-in page should load, and `https://....onrender.com/api/health` should show `{"status":"ok"}`.
6. Test sign-up, sign-in and the board on that live address. Refresh the page on `/board` to confirm deep links work.
7. Put the live address in `README.md`.

Free tiers change and may sleep after inactivity; the first load can take about a minute. Check Render's current limits.

## 5. Screenshots to take (for the README)
Sign-in page, Projects page, Board with a few tasks in different columns, Board in mobile view (browser DevTools -> device toolbar). Use test data only. Upload them to a `docs/screenshots` folder on GitHub and link them in the README.
