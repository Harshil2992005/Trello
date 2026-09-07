# Mini-Trello · Kanban Board

A full-stack, single-page Kanban board where users create tasks and move them through three columns — **To Do → In Progress → Done**.

Built as a 7th-semester Agile (Scrum) project with a premium UI (glassmorphism, smooth animations, and drag-and-drop) hand-coded in plain CSS + Vanilla JS.

🔗 Live demo: [https://mini-trello-2026.onrender.com](https://mini-trello-2026.onrender.com)

## 👤 Author

**Harshilkumar It-15** — this project was built and designed by me as my 7th-semester Agile (Scrum) mini-project.

## ✨ Features

- Create tasks via an animated modal form (Title + Description required)
- Three columns — To Do, In Progress, Done — with styled cards
- Move tasks with **Next / Previous buttons** or **drag-and-drop**
- Delete tasks with a confirmation dialog
- Per-task **progress percentage** slider (visible on In Progress cards) — synced automatically to 0% on To Do and 100% on Done
- Live overall progress indicator in the header (average progress across all tasks)
- Click a card to open a read-only view with the full title/description
- Empty-state messages and loading skeleton on page load
- Responsive layout for mobile

## 🧱 Tech Stack

| Layer     | Technology                              |
|-----------|------------------------------------------|
| Frontend  | HTML, CSS, Vanilla JavaScript (`fetch()`) |
| Backend   | Node.js + Express (RESTful API)           |
| Database  | MongoDB (via Mongoose)                    |

## 🗂 Project Structure

```
project/
├── backend/
│   ├── server.js          # Express app + all API routes
│   ├── models/
│   │   └── Task.js        # Task schema (title, description, status, progress)
│   ├── public/            # served as static frontend in production
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── package.json
│   ├── .env.example       # copy to .env and add your MongoDB URI
│   └── .env               # your MongoDB connection string (not committed)
├── frontend/
│   ├── index.html         # page layout (header + 3 columns + modal)
│   ├── style.css           # premium design system
│   └── app.js             # board state, drag/drop, API calls
├── .gitignore              # keeps node_modules/ and .env out of version control
└── README.md
```

## 📦 API Endpoints

| Method | Endpoint         | Description                          |
|--------|------------------|---------------------------------------|
| GET    | /tasks           | Fetch all tasks                       |
| POST   | /tasks           | Create a task (defaults to `todo`)    |
| PATCH  | /tasks/:id       | Update task fields (status, progress) |
| DELETE | /tasks/:id       | Delete a task                         |

### Task object

```json
{
  "_id": "655f001122...",
  "title": "Design Database Schema",
  "description": "Create ER diagram for the task tables.",
  "status": "in_progress",
  "progress": 45
}
```

## 🚀 Running Locally

### Prerequisites

- Node.js (v18+)
- A MongoDB instance — either **MongoDB Atlas** (free, no install) or **local MongoDB**

### 1. Set up MongoDB

**Option A — MongoDB Atlas (recommended):**
1. Create a free account at https://www.mongodb.com/atlas
2. Create a free cluster (M0)
3. Click **Connect → Connect your application** and copy the connection string, e.g.:
   `mongodb+srv://youruser:yourpassword@cluster.mongodb.net/mini-trello`
4. In `backend/`, copy `.env.example` to `.env` and paste your connection string as `MONGODB_URI`

**Option B — Local MongoDB:**
1. Install "MongoDB Community Server" from https://www.mongodb.com/try/download/community
2. Copy `backend/.env.example` to `backend/.env` and leave `MONGODB_URI` at
   `mongodb://127.0.0.1:27017/mini-trello`

> **Note:** The connection string is read from `backend/.env`. This file is not committed to
> version control (see `.gitignore`), so your database password stays private.

### 2. Backend

```bash
cd backend
npm install
npm start
```

You should see: `Server running at http://localhost:5000`

### 3. Frontend

Open `frontend/index.html` directly in your browser (double-click it, or drag it into a browser tab).

Test the API with Postman at `http://localhost:5000/tasks`.

## 🌐 Deploy Online (Free — Render + MongoDB Atlas)

You can host the entire app (backend + frontend) for free on **Render.com** with a **MongoDB Atlas** free database.

### Step 1 — Set up MongoDB Atlas (free)

1. Sign up at https://www.mongodb.com/atlas
2. Create a free **M0** cluster
3. Go to **Database Access** → create a username/password
4. Go to **Network Access** → add IP `0.0.0.0/0` (allow all)
5. Go to **Database** → click **Connect** → **Connect your application**
6. Copy the connection string, e.g.:
   `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/mini-trello`

### Step 2 — Push your code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3 — Deploy on Render

1. Sign up at https://render.com (free)
2. Click **New +** → **Web Service**
3. Connect your GitHub repo: `Harshil2992005/Trello`
4. Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | mini-trello |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

5. Go to **Environment** → add this variable:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | *(paste your Atlas connection string from Step 1)* |

6. Click **Create Web Service** → wait 2-3 minutes → your app is live!

Your app will be at: `https://mini-trello-xxxx.onrender.com`

> **Note:** Render free tier spins down after 15 minutes of inactivity. First request after idle may take 30-50 seconds to wake up.

## 🧪 Testing with Postman

- `GET  http://localhost:5000/tasks` → get all tasks
- `POST http://localhost:5000/tasks` with JSON body `{ "title": "My Task", "description": "details" }` → create a task
- `PATCH http://localhost:5000/tasks/<taskId>` with body `{ "status": "in_progress" }` → move a task
- `PATCH http://localhost:5000/tasks/<taskId>` with body `{ "progress": 60 }` → update task progress
- `DELETE http://localhost:5000/tasks/<taskId>` → delete a task

## 📓 Notes

-
- Just submit the source code (backend + frontend + this README)