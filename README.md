# Mini-Trello · Kanban Board

A full-stack, single-page Kanban board where users create tasks and move them through three columns — **To Do → In Progress → Done**.

Built as a 7th-semester Agile (Scrum) project with a premium UI (glassmorphism, smooth animations, and drag-and-drop) hand-coded in plain CSS + Vanilla JS.

🔗 Live demo: [add your deployed link here, if any]

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
│   ├── package.json
│   ├── .env.example       # copy to .env and add your MongoDB URI
│   └── .env               # your MongoDB connection string (not committed)
├── .gitignore              # keeps node_modules/ and .env out of version control
└── frontend/
    ├── index.html         # page layout (header + 3 columns + modal)
    ├── style.css           # premium design system
    └── app.js             # board state, drag/drop, API calls
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

## 🧪 Testing with Postman

- `GET  http://localhost:5000/tasks` → get all tasks
- `POST http://localhost:5000/tasks` with JSON body `{ "title": "My Task", "description": "details" }` → create a task
- `PATCH http://localhost:5000/tasks/<taskId>` with body `{ "status": "in_progress" }` → move a task
- `PATCH http://localhost:5000/tasks/<taskId>` with body `{ "progress": 60 }` → update task progress
- `DELETE http://localhost:5000/tasks/<taskId>` → delete a task

## 📓 Notes

- Do not commit `node_modules/` in your zip submission
- Just submit the source code (backend + frontend + this README)