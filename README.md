# This is a job portal Made by Akshdeep, Souren, Debayan. Debojyoti, Ayan, Pushpita, Gargi !!

# HireFast

A small job portal made with MongoDB, Express, React and Node.js.

## Features

- Job seekers can register, browse job details, upload a resume and apply.
- Job seekers can see the jobs they have applied for.
- Recruiters can post jobs, see applicants and download their resumes.
- Admins can review and approve job posts.
- Resume files (PDF, DOC or DOCX, up to 5 MB) are stored in MongoDB with each application.
- Login uses a simple token so each role sees its own page.

## Run the project

1. Install Node.js and MongoDB Community Server.
2. Start the MongoDB Community Server service. The app connects to `mongodb://127.0.0.1:27017/hirefast`.
3. In the project folder run `npm install` once. (The root package installs both workspaces.)
4. Run `npm run dev` to start the client and server together.
5. Open `http://localhost:5173` in your browser.

### Load sample MongoDB data

With MongoDB running, run `npm run seed --prefix server` from the project
folder. The command creates or updates three demo accounts and three sample
jobs without deleting other data. Newly created demo accounts use the password
`HireFast123!`; existing accounts keep their current passwords. Sign in as the
recruiter to see the recruiter dashboard, as the admin to review a pending job,
or as the seeker to browse approved jobs. The seed does not create a sample
resume or application, so those dashboard sections fill in when a seeker applies.

The server defaults to `mongodb://127.0.0.1:27017/hirefast` and a local-only
JWT key when `server/.env` is absent. For Atlas or deployment, copy
`server/.env.example` to `server/.env` and set a private `MONGO_URL` and
`TOKEN_KEY`.

MongoDB creates the `hirefast` database and its `users` and `jobs` collections. If you see “MongoDB is not connected”, start MongoDB Community Server and check `MONGO_URL` in `server/.env`. The API status is shown at `http://localhost:5000/api`.

For the local admin demo, register with `admin@hirefast.com`. The app assigns that address the admin role in `server/routes/users.js`.

## Try the full job flow

1. Register a recruiter account and post a job.
2. Register the admin account with `admin@hirefast.com` and approve that job.
3. Register a job seeker account, browse the job and apply.
4. Log in as the recruiter to see the applicant.

## Folder guide

- `client/src/pages` contains the main screens.
- `client/src/components` contains small parts shared by screens.
- `server/models` describes the MongoDB data.
- `server/routes` contains the API actions.
- `server/middleware` checks login tokens.



