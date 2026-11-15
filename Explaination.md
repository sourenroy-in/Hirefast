# HireFast code guide

This guide follows the path the app takes when it starts: first React opens the page, then the page calls Express, and Express reads or changes MongoDB data.

## 1. Start the project

Open a terminal in the main `Hirefast Codex` folder. Run `npm install` once, then `npm run dev`.

- Vite serves the React page at `http://localhost:5173`.
- Express serves the API at `http://localhost:5000`.
- MongoDB stores accounts, jobs and applications. It must be running for those features to work.
- In the Vite terminal, `Local: http://localhost:5173/` means the frontend started. Keep both terminal processes running.

The root `package.json` has two workspaces (`client` and `server`), so one install command installs both sets of packages. Its `dev` command starts both servers together.

## 2. Folders at a glance

```text
client/                 React website
  index.html             Browser page with the React root
  vite.config.js         Vite address and API forwarding rule
  src/
    main.jsx             Starts React
    App.jsx              Chooses which page to show
    api.js               Sends requests to the backend
    components/          Small pieces used by more than one page
    pages/               Main screens, one file per screen
    style.css            Website appearance
server/                 Express API and MongoDB code
  index.js               Starts Express and connects MongoDB
  models/                Shape of saved MongoDB records
  routes/                API actions grouped by feature
  middleware/            Checks whether a request is logged in
```

## 3. How the frontend starts

### `client/index.html`

This is the basic HTML page the browser first opens. The empty `<div id="root">` is where React puts the website. The script line loads `src/main.jsx`.

### `client/src/main.jsx`

This is the React starting point. It imports React, the `App` component and the CSS file. `createRoot(...).render(<App />)` tells React to draw the app inside the HTML `root` element.

### `client/src/App.jsx`

`App` is the main traffic controller for the screens. It remembers the signed-in user and the current page using `useState`.

- With no saved login, it shows `Welcome`.
- The welcome buttons change the page to `login` or `register`.
- After login, `user.role` decides which screen to show: seeker jobs, recruiter tools or admin review.
- `savedUser()` safely reads the saved user. If old saved data is broken, the app opens at the welcome page instead of crashing.
- `logIn()` saves the token and user in browser storage. `logOut()` removes them.

### `client/src/pages/Welcome.jsx`

The first screen, with a short introduction and buttons. It receives `onLogin` and `onRegister` as props. A prop is a value or function passed from a parent component to a child.

### `client/src/pages/Account.jsx`

Shows the login or register form. `useState` remembers what the user types. When the form is submitted, it calls the backend. Successful login passes the result up to `App` using `onDone`; errors are shown with `Message`.

### `client/src/pages/Jobs.jsx`

Loads approved job details and filters them using the search box. A seeker selects a PDF, DOC or DOCX resume and applies; the resume is saved with the application in MongoDB. A seeker can switch to their applications list. A visitor can browse jobs without logging in.

### `client/src/pages/Recruiter.jsx`

Lets a recruiter submit a job, see their own posts and applicants, download applicants' resumes, and remove their own posts. New jobs wait for admin approval before appearing in the seeker list.

### `client/src/pages/Admin.jsx`

Loads jobs waiting for review and applications across all jobs. The admin can approve a job, remove it, and download applicant resumes.

### `client/src/components/TopBar.jsx` and `Message.jsx`

These are small shared parts. `TopBar` displays the site name, Home and Login controls, plus the signed-in user's name and Log out button. `Message` shows a normal or error message so pages do not each need to build one themselves.

### `client/src/api.js`

`callApi()` is a small helper around the browser's `fetch()` function. It adds the saved login token when there is one, reads the JSON reply and turns an unsuccessful reply into a readable error. Locally it uses `/api`, which Vite forwards to Express. For the deployed website, `VITE_API_URL` points to the Render API.

### `client/src/style.css`

Contains the colors, spacing, fonts and mobile layout. It changes how elements look; the JSX files decide what appears and what happens when clicked.

## 4. How Vite connects to Express

### `client/vite.config.js`

Vite is the development server and builder for the React files. This config keeps the frontend at port `5173`. Its `proxy` rule forwards requests beginning with `/api` to Express at port `5000`.

For example, the React code asks for `/api/jobs`. Vite sends that request to `http://127.0.0.1:5000/api/jobs`. This keeps the frontend code short and avoids a separate browser cross-origin setup during development.

## 5. How the backend starts

### `server/index.js`

This file creates the Express app. `express.json()` lets it read JSON request bodies. The `/api` route reports whether the database is connected. The two `app.use()` lines attach the account and job routes. Finally, it opens port `5000` and tries to connect to MongoDB using settings from `.env`.

### `server/models/User.js` and `server/models/Job.js`

A model describes the fields stored for each kind of record. A user has a name, email, password and role. A job has a title, company, place, description, owner, approval status, applicant list and applications. Each new application keeps a small resume file (up to 5 MB) in MongoDB.

### `server/routes/users.js`

Contains the account API actions: `/register` makes an account and hashes its password; `/login` checks the password and returns a signed token.

### `server/routes/jobs.js`

Contains the job API actions: list approved jobs, create a job, list a recruiter's own jobs and applicants, list a seeker's applications, apply with a resume, download a resume for the job owner/admin, list jobs for admin review, approve a job, and remove posts.

### `server/middleware/login.js`

Middleware is a small check that runs before some API actions. `loginNeeded` checks the token. `roleNeeded` checks the account role, so only recruiters can post jobs and only admins can review them.

### `server/.env`

Stores local settings such as the MongoDB address and token key. Keep this private; `.gitignore` excludes it from Git.

## 6. Follow one request from the button to the database

When a recruiter posts a job:

1. `Recruiter.jsx` reads the form and calls `callApi("/jobs", ...)`.
2. `api.js` sends JSON to `/api/jobs` and adds the login token.
3. Vite forwards `/api/jobs` to Express on port `5000`.
4. `server/routes/jobs.js` checks login and recruiter role, then creates the job.
5. `Job.js` describes how that job is saved in MongoDB.
6. The route replies with JSON; the React page shows a message and reloads the recruiter's job list.

The same pattern is used by account creation, job browsing, applying and admin review.

## 7. Useful commands

Run these from the main project folder:

```powershell
npm install
npm run dev
```

To build only the frontend and catch compile errors:

```powershell
npm run build --workspace client
```

If port `5173` or `5000` is already taken, stop the earlier server terminal with `Ctrl+C` before starting it again. If the page opens but accounts/jobs fail, check that MongoDB is running and visit `http://localhost:5000/api` to check its status.
