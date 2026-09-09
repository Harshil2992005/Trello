# Mini-Trello Kanban Board — Task Management Application Project Report

| Field                | Detail                                      |
|----------------------|----------------------------------------------|
| Project              | Mini-Trello Kanban Board                     |
| Student Name         | Harshilkumar                                 |
| Enrollment Number    | (fill your enrollment number)                |
| Team                 | Individual                                   |
| Semester             | 7th Semester                                 |
| Methodology          | Agile / Scrum (two one-week sprints)         |

---

## 1. Project Overview

Mini-Trello is a simple, modern, responsive single-page Kanban task-management application. A user can create tasks, view them grouped into three status columns (To Do, In Progress, Done), move tasks between the columns with Next/Previous controls or drag-and-drop, and delete tasks. All data is stored in a real database and every action goes through a RESTful API, so the board state survives browser refreshes.

The project was developed to practice the full stack: a Vanilla JavaScript frontend, a Node.js + Express backend, and a NoSQL database (MongoDB), while applying Agile/Scrum across two one-week sprints.

**Live Demo:** [https://trello-1-848v.onrender.com](https://trello-1-848v.onrender.com)

---

## 2. Objectives

- Build a task-management board with three columns and create/move/delete flows.
- Implement a RESTful API (GET, POST, PATCH, DELETE) with JSON in/out.
- Store tasks in a real database with persistence across restarts.
- Integrate a Vanilla JS frontend with a Node.js + Express backend over HTTP.
- Add per-task progress tracking with automatic sync on column change.
- Implement drag-and-drop for task movement between columns.
- Add a Board/Table view toggle for switching between Kanban board and numbered task list.
- Implement Dark/Light mode toggle with localStorage theme persistence.
- Apply Agile/Scrum methodology with two one-week sprints.

---

## 3. Technology Stack

| Layer        | Technology                                                       |
|--------------|------------------------------------------------------------------|
| Frontend     | HTML5, CSS3 (custom properties / design tokens), Vanilla JavaScript (`fetch()`) |
| Backend      | Node.js v18+, Express 4.19, CORS middleware, dotenv              |
| Database     | MongoDB 8.x (via Mongoose ODM)                                   |
| UI / Theming | Glassmorphism design system, Indigo accent, smooth CSS animations|
| API Style    | REST, JSON                                                       |
| Hosting      | Render.com (free tier) + MongoDB Atlas (free M0 cluster)         |

---

## 4. System Architecture

```
Browser (Single-Page App)
│  fetch() / XMLHttpRequest
▼
Express REST API  (server.js — port 5000)
│  Mongoose ODM (parameterized queries)
▼
MongoDB Database  (tasks collection)
```

**Detailed flow:**

```
Browser (HTML + CSS + Vanilla JS)
  index.html + style.css + app.js
        │
        │  fetch("/tasks")   fetch("/tasks", {method:"POST"})
        ▼                     ▼
  ┌─────────────────────────────────────────┐
  │   Express.js Server (server.js)         │
  │   - CORS enabled                        │
  │   - JSON body parsing                   │
  │   - Static file serving (public/)       │
  │   - Input validation & error handling   │
  │   - Graceful shutdown handler           │
  └─────────────────────────────────────────┘
        │
        │  Mongoose Schema + Model
        ▼
  ┌─────────────────────────────────────────┐
  │   MongoDB Database                      │
  │   Collection: tasks                     │
  │   Fields: title, description, status,   │
  │           progress, createdBy,          │
  │           createdAt, updatedAt          │
  └─────────────────────────────────────────┘
```

---

## 5. Database Design

The application uses a single `tasks` collection in MongoDB:

| Column       | Type             | Notes                                                    |
|--------------|------------------|----------------------------------------------------------|
| _id          | ObjectId (PK)    | Auto-generated unique task identifier                    |
| title        | String           | Required, trimmed                                         |
| description  | String           | Optional, defaults to empty string                        |
| status       | String (enum)    | `todo` / `in_progress` / `done` (CHECK constraint)       |
| progress     | Number           | 0–100, auto-synced with column (todo=0, done=100)        |
| createdBy    | String           | Required — name of the person who created the task       |
| createdAt    | DateTime         | Auto-set by Mongoose `timestamps: true`                  |
| updatedAt    | DateTime         | Auto-updated by Mongoose `timestamps: true`              |

**Schema definition (Task.js):**
```javascript
const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, default: "", trim: true },
    status:      { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    progress:    { type: Number, min: 0, max: 100, default: 0 },
    createdBy:   { type: String, required: [true, "createdBy is required"], trim: true }
  },
  { timestamps: true }
);
```

The collection is created automatically by Mongoose on first insert; no manual schema setup is required.

---

## 6. UI Design & Theming

The final UI is a modern indigo-based design system. Every colour, shadow, and spacing value is defined once as a CSS custom property (design token) in `frontend/style.css`, so the whole app is themed consistently and can be re-skinned without touching component code.

- **Primary Accent:** Indigo (#6366f1) with hover state (#4f46e5)
- **Background:** Soft slate (#f8fafc) with white card surfaces
- **Column backgrounds:** Subtle tinted — green for To Do (#f1f5f0), blue for In Progress (#e8f0fe), bright green for Done (#e6f7e6)
- **Card left-border accents:** Gray for To Do, Indigo for In Progress, Green for Done — matching status
- **Glassmorphism header:** `backdrop-filter: blur(12px)` with semi-transparent background
- **Font:** Google Fonts "Inter" (weights 400, 500, 600, 700)
- **Shadows:** 4-level shadow system (sm, md, lg, lift) for depth hierarchy
- **Animations:** Toast slide-in/out, modal scale-in, shimmer skeleton loading, card hover lift
- **Progress bar:** Gradient fill (indigo to purple) with smooth CSS transition
- **Avatar system:** Deterministic color from name hash, shows first initial in colored circle
- **Date pills:** Rounded badges showing task creation date
- **Responsive breakpoints:** 768px (tablet — single column) and 480px (phone — tighter padding)
- **Custom scrollbar:** Thin 6px webkit scrollbar for modern browsers
- **Dark/Light mode:** Toggle button in header switches between light (default) and dark (slate navy) themes; choice saved in localStorage under `mtTheme` and restored before first paint to avoid flash
- **Dark mode palette:** Background (#0f172a), surface (#1e293b), border (#334155), text (#f1f5f9); status badges recolored for dark contrast

---

## 7. User Stories & Product Backlog

| ID  | Story                                        | Priority | Story Points |
|-----|----------------------------------------------|----------|--------------|
| US1 | Create a new task via animated modal form    | High     | 5            |
| US2 | See all tasks grouped by status in 3 columns | High     | 3            |
| US3 | Move tasks To Do → In Progress → Done        | High     | 5            |
| US4 | Delete a task with confirmation dialog       | Medium   | 3            |
| US5 | Track per-task progress percentage           | Medium   | 3            |
| US6 | Drag-and-drop task movement between columns  | Medium   | 3            |
| US7 | Live overall progress indicator in header    | Low      | 2            |
| US8 | First-visit name prompt + avatar system      | Low      | 2            |
| US9 | Toast notifications for user feedback        | Low      | 1            |
| US10| Board / Table view toggle                    | Medium   | 3            |
| US11| Dark / Light mode toggle with persistence    | Medium   | 3            |

**Total estimate: 33 story points.** Full acceptance criteria in project documentation. Sprint 1 owns US1 + US2 + US9 (foundation); Sprint 2 owns US3 + US4 + US5 + US6 + US7 + US8 + US10 + US11 (integration & polish).

---

## 8. Sprint 1 — Foundation & Setup

**Goal:** Working database, GET/POST APIs, static board UI, basic task creation flow.

- Designed the MongoDB tasks collection schema with Mongoose.
- Implemented the Task model with title/description/status validation.
- Implemented and tested GET `/tasks` and POST `/tasks` API routes.
- Added server-side input validation (title required, createdBy required, status enum).
- Scaffolded the HTML + CSS frontend with the three-column Kanban board layout.
- Built the "Create New Task" animated modal form with inline validation.
- Implemented toast notification system for success/error feedback.
- Added loading skeleton placeholders during initial data fetch.
- Set up project structure: `backend/` (server + models), `frontend/` (HTML/CSS/JS), `backend/public/` (production copy).

**Deliverable:** Working MongoDB database, GET/POST APIs testable via Postman, static UI with task creation flow.

---

## 9. Sprint 2 — Integration & Delivery

**Goal:** Complete integration, drag-and-drop, progress tracking, and production deployment.

- Implemented PATCH `/tasks/:id` with smart progress auto-sync (todo=0%, done=100%, in_progress=keeps existing).
- Implemented DELETE `/tasks/:id` with 404 handling and confirmation modal.
- Connected the frontend through a centralized `apiFetch()` helper with error parsing.
- Implemented task movement with Next/Previous buttons and status validation.
- Added drag-and-drop using native HTML5 Drag and Drop API (dragstart, dragover, drop).
- Added per-task progress slider with optimistic UI updates and debounced saves (300ms).
- Protected active sliders from re-renders using an `activeSliders` Set pattern.
- Added live polling: re-fetches tasks every 5 seconds with signature-based diff detection (only re-renders on actual data change).
- Built first-visit name prompt modal with localStorage persistence.
- Created avatar system with deterministic color selection from name hash.
- Added overall progress indicator in header (average of all task progress values).
- Added delete confirmation modal with warning icon and cancel/confirm options.
- Built responsive layout with breakpoints at 768px and 480px.
- Redesigned UI to indigo-based design system with glassmorphism header, card hover effects, and shadow hierarchy.
- Implemented Board/Table view toggle: header button switches between Kanban board and numbered task table with color-coded status badges.
- Implemented Dark/Light mode toggle: CSS custom properties swap under `[data-theme="dark"]`, localStorage persistence, sun/moon icon button.
- Deployed on Render.com with MongoDB Atlas free M0 cluster.
- Prepared README and project report.

---

## 10. REST API Documentation

**Base URL:** `https://trello-1-848v.onrender.com`

| Method | Endpoint         | Purpose                                      | Status Codes      |
|--------|------------------|----------------------------------------------|-------------------|
| GET    | /tasks           | Fetch all tasks (newest first)               | 200 OK            |
| POST   | /tasks           | Create task (status defaults to `todo`)      | 201 Created, 400  |
| PATCH  | /tasks/:id       | Update task fields (status, progress, title) | 200 OK, 400, 404  |
| DELETE | /tasks/:id       | Delete a task                                | 200 OK, 404       |

**Error format:** `{"error": "message"}` with status 400 (validation), 404 (not found), 500 (server).

### Sample POST request:
```json
POST /tasks
Content-Type: application/json

{
  "title": "Design Database Schema",
  "description": "Create ER diagram for the task tables.",
  "createdBy": "Harshil"
}
```

### Sample POST response (201):
```json
{
  "_id": "655f001122abc...",
  "title": "Design Database Schema",
  "description": "Create ER diagram for the task tables.",
  "status": "todo",
  "progress": 0,
  "createdBy": "Harshil",
  "createdAt": "2026-09-01T10:30:00.000Z",
  "updatedAt": "2026-09-01T10:30:00.000Z"
}
```

### Sample PATCH request (move task):
```json
PATCH /tasks/655f001122abc...
Content-Type: application/json

{ "status": "in_progress" }
```

### Sample PATCH response (200):
```json
{
  "_id": "655f001122abc...",
  "title": "Design Database Schema",
  "status": "in_progress",
  "progress": 45
}
```

### Sample DELETE response (200):
```json
{ "message": "Task deleted" }
```

---

## 11. Key Features (Detailed)

### 11.1 Task Creation
- Animated modal form with scale-in CSS transition
- Title (required) and Description (optional) fields
- Inline real-time validation — title error shown immediately if empty
- Backend re-validates: returns 400 if title or createdBy is missing
- CreatedBy stored from localStorage (first-visit name prompt)
- Success toast notification on creation

### 11.2 Task Movement (Next/Previous Buttons)
- Next button: todo → in_progress → done
- Previous button: done → in_progress → todo
- Auto-syncs progress: todo=0%, done=100%, in_progress=keeps current value
- Optimistic UI: board updates instantly, API call happens in background
- Error toast on API failure with automatic rollback

### 11.3 Drag and Drop
- Native HTML5 Drag and Drop API (no library)
- Cards are `draggable="true"` — shows grab cursor
- Columns highlight with dashed indigo border on dragover
- Drop triggers PATCH API call to update status
- Dragged card shows 50% opacity + rotation during drag
- `dragend` event cleans up all visual states

### 11.4 Progress Tracking
- Range slider (0–100%) visible only on In Progress cards
- Custom-styled with CSS (gradient fill, indigo accent)
- Optimistic UI: slider moves immediately, debounced save after 300ms
- `activeSliders` Set prevents re-render from resetting mid-drag slider
- Overall progress bar in header = average of all task progress values
- Progress auto-resets to 0% when moved to To Do
- Progress auto-sets to 100% when moved to Done

### 11.5 Delete with Confirmation
- Delete button opens confirmation modal with warning icon
- "This action cannot be undone" message
- Cancel or Delete buttons — Escape key also cancels
- Success toast on deletion
- 404 error toast if task was already deleted

### 11.6 Live Sync (Polling)
- Fetches GET `/tasks` every 5 seconds via `setInterval`
- Computes a "signature" string (IDs + statuses + progress values)
- Only re-renders the board if the signature has changed
- Prevents unnecessary DOM updates that would interrupt drag operations
- Preserves active slider DOM nodes during re-renders

### 11.7 Name System & Avatars
- First visit shows a name prompt modal (non-dismissible until name entered)
- Name stored in localStorage under key `mtUserName`
- Avatar: colored circle with first initial of name
- Color is deterministic — derived from hash of the name string
- 8 predefined avatar colors: indigo, purple, pink, amber, emerald, cyan, red, blue

### 11.8 Skeleton Loading
- `<template>` element contains skeleton card markup
- Shows 2 shimmer cards per column while data loads
- CSS `@keyframes shimmer` with gradient animation
- Automatically hidden once real tasks are rendered

### 11.9 Toast Notifications
- Three types: success (green), error (red), info (dark slate)
- Auto-dismiss after 2.8 seconds
- Slide-up animation on appear, slide-out on dismiss
- Stacked from bottom-right corner
- No duplicate toast prevention (each action shows one toast)

### 11.10 Board / Table View Toggle
- Two toggle buttons in header: "Board" (grid icon) and "Table" (list icon)
- Board view (default): 3-column Kanban layout with cards
- Table view: Clean numbered table with columns — #, Title, Description, Status, Created By, Date
- Status badges in table are color-coded: gray for To Do, purple for In Progress, green for Done
- Table auto-uploads when tasks change (via `cachedTasks` array)
- Responsive: Description and Created By columns hide on mobile (<768px)
- Empty state with icon and message when no tasks exist

### 11.11 Dark / Light Mode Toggle
- Toggle button in header: shows Moon icon in light mode, Sun icon in dark mode
- Light mode (default): white background (#f8fafc), dark text (#0f172a), indigo accent
- Dark mode: slate navy background (#0f172a), light text (#f1f5f9), muted borders (#334155)
- All CSS variables swap under `[data-theme="dark"]` selector
- Theme saved in localStorage under key `mtTheme`; restored before first paint (no flash)
- Status badges recolored for dark contrast (dark backgrounds with bright text)
- Header uses semi-transparent dark background with blur in dark mode
- Modal overlays use darker backdrop in dark mode

---

## 12. Testing

### 12.1 API Testing (Postman / Manual)

| #  | Test Case                       | Input / Action              | Expected Result                  | Status |
|----|--------------------------------|------------------------------|----------------------------------|--------|
| 1  | GET empty database             | GET /tasks                   | 200, empty array `[]`            | Pass   |
| 2  | POST create task (valid)       | POST /tasks with title + createdBy | 201, status="todo"         | Pass   |
| 3  | POST empty title               | POST /tasks, title=""        | 400, "Title is required"         | Pass   |
| 4  | POST missing createdBy         | POST /tasks, no createdBy    | 400, "createdBy is required"     | Pass   |
| 5  | POST invalid status            | POST /tasks, status="review" | 400, "Invalid status"            | Pass   |
| 6  | PATCH move to in_progress      | PATCH /tasks/:id, status="in_progress" | 200, updated task    | Pass   |
| 7  | PATCH move to done (progress auto=100) | PATCH /tasks/:id, status="done" | 200, progress=100     | Pass   |
| 8  | PATCH move to todo (progress auto=0)   | PATCH /tasks/:id, status="todo" | 200, progress=0       | Pass   |
| 9  | PATCH update progress          | PATCH /tasks/:id, progress=65 | 200, progress=65                 | Pass   |
| 10 | PATCH invalid progress (>100)  | PATCH /tasks/:id, progress=150| 400, "Progress must be 0-100"    | Pass   |
| 11 | PATCH invalid progress (<0)    | PATCH /tasks/:id, progress=-5 | 400, "Progress must be 0-100"    | Pass   |
| 12 | PATCH invalid status           | PATCH /tasks/:id, status="xyz"| 400, "Invalid status"            | Pass   |
| 13 | PATCH missing task             | PATCH /tasks/99999            | 404, "Task not found"            | Pass   |
| 14 | PATCH invalid ID format        | PATCH /tasks/abc123           | 400, "Invalid task ID"           | Pass   |
| 15 | DELETE existing task           | DELETE /tasks/:id             | 200, "Task deleted"              | Pass   |
| 16 | DELETE missing task            | DELETE /tasks/99999           | 404, "Task not found"            | Pass   |
| 17 | DELETE invalid ID format       | DELETE /tasks/abc123          | 400, "Invalid task ID"           | Pass   |
| 18 | Full cycle (create→move→delete)| POST → PATCH → DELETE         | All 200/201, data persists       | Pass   |

**Result: 18/18 API tests passed.**

### 12.2 Browser / E2E Testing (Manual)

| #  | Test Case                                | Expected Result                        | Status |
|----|------------------------------------------|----------------------------------------|--------|
| 1  | Page loads with skeleton placeholders    | Shimmer cards visible, then replaced   | Pass   |
| 2  | Name modal appears on first visit        | Non-dismissible modal with name input  | Pass   |
| 3  | Name saved to localStorage               | After refresh, name modal doesn't show | Pass   |
| 4  | Create task via modal                    | Task appears in To Do column           | Pass   |
| 5  | Create task with empty title             | Inline error shown, form not submitted | Pass   |
| 6  | Move task with Next button               | Task moves to next column              | Pass   |
| 7  | Move task with Previous button           | Task moves to previous column          | Pass   |
| 8  | Drag task from To Do to In Progress      | Task moves, status updated in DB       | Pass   |
| 9  | Drag task from In Progress to Done       | Task moves, progress auto-set to 100   | Pass   |
| 10 | Drag task from Done back to To Do        | Task moves, progress auto-set to 0     | Pass   |
| 11 | Progress slider on In Progress card      | Slider visible, value saves on change  | Pass   |
| 12 | Progress slider NOT on To Do card        | No slider visible                      | Pass   |
| 13 | Progress slider NOT on Done card         | No slider visible                      | Pass   |
| 14 | Delete task → confirmation modal         | Modal with warning, Cancel/Delete      | Pass   |
| 15 | Cancel delete                            | Modal closes, task remains             | Pass   |
| 16 | Confirm delete                           | Task removed, success toast shown      | Pass   |
| 17 | Overall progress bar in header           | Updates as task progress changes       | Pass   |
| 18 | Column badge counts update               | Counts match visible cards             | Pass   |
| 19 | Empty state message when no tasks        | "No tasks yet" message visible         | Pass   |
| 20 | Toast notifications appear and dismiss   | Auto-dismiss after ~3 seconds          | Pass   |
| 21 | Browser refresh persists data            | All tasks still visible after refresh  | Pass   |
| 22 | Responsive layout on mobile              | Single-column layout, usable           | Pass   |
| 23 | ESC key closes modals                    | Modal closes on Escape                 | Pass   |
| 24 | Backdrop click closes create modal       | Modal closes on overlay click          | Pass   |
| 25 | Click "Table" toggle button              | Board hidden, numbered table shown     | Pass   |
| 26 | Click "Board" toggle button              | Table hidden, Kanban board shown       | Pass   |
| 27 | Table shows all tasks numbered           | # column auto-increments (1, 2, 3...)  | Pass   |
| 28 | Table status badges color-coded          | To Do=gray, In Progress=purple, Done=green | Pass |
| 29 | Table empty state when no tasks          | "No tasks yet" message visible         | Pass   |
| 30 | Click theme toggle (dark mode)           | Background changes to slate navy       | Pass   |
| 31 | Click theme toggle (light mode)          | Background changes to white            | Pass   |
| 32 | Theme persists after refresh             | Same theme restored on reload          | Pass   |
| 33 | Dark mode: status badges readable        | Badges have dark bg + bright text      | Pass   |
| 34 | Dark mode: modals visible                | Modal backdrop darker, content visible | Pass   |

**Result: 34/34 E2E checks passed.**

---

## 13. Screenshots

All screenshots should be captured from the live application at [https://trello-1-848v.onrender.com](https://trello-1-848v.onrender.com) using a browser.

### Suggested Screenshots to Capture:

| Figure | Description                                                         | How to Capture                                        |
|--------|---------------------------------------------------------------------|-------------------------------------------------------|
| 1      | Main board with tasks (To Do, In Progress, Done columns)            | Create 3-4 tasks, move them to different columns      |
| 2      | "Create New Task" modal (empty form)                                | Click "Create New Task" button                        |
| 3      | "Create New Task" modal (filled form with validation)               | Type title and description, show empty title error    |
| 4      | First-visit name prompt modal                                       | Open in incognito/clear localStorage                  |
| 5      | Task card in To Do column (with avatar, date, buttons)              | Show a task in the first column                       |
| 6      | Task card in In Progress column (with progress slider at ~50%)      | Move task and adjust slider                           |
| 7      | Task card in Done column (green border, no slider)                  | Move task to Done column                              |
| 8      | Delete confirmation modal                                           | Click delete button on any task                       |
| 9      | Overall progress indicator in header                                | Show header with progress bar filled                  |
| 10     | Drag-and-drop in action (card being dragged between columns)        | Capture mid-drag with column highlight                |
| 11     | Toast notification (success after task creation)                    | Create a task, capture the green toast                |
| 12     | Empty board state (no tasks, all empty states visible)              | Delete all tasks or open fresh account                |
| 13     | Responsive mobile layout                                            | Open DevTools, set to mobile viewport (375px)         |
| 14     | Loading skeleton placeholders                                       | Refresh page, capture during initial load             |
| 15     | API requests in browser DevTools Network tab                        | Open Network tab, create/move/delete tasks            |
| 16     | Table view with all tasks (numbered list)                          | Click "Table" toggle, show numbered task table        |
| 17     | Dark mode main board                                               | Click theme toggle to dark, show Kanban board         |
| 18     | Dark mode table view                                               | Dark theme with numbered task table                   |
| 19     | Board/Table toggle in header (both buttons visible)                | Show header with toggle buttons                       |

---

## 14. Project Structure

```
trello/
├── backend/
│   ├── server.js              # Express app + all API routes (199 lines)
│   ├── models/
│   │   └── Task.js            # Mongoose Task schema (49 lines)
│   ├── public/                # Production frontend (served by Express)
│   │   ├── index.html         # Page layout (153 lines)
│   │   ├── style.css          # Design system (904 lines)
│   │   └── app.js             # Board logic + drag/drop (624 lines)
│   ├── package.json           # Dependencies & scripts
│   ├── .env.example           # Template for environment variables
│   └── .env                   # MongoDB connection string (gitignored)
├── frontend/                  # Development frontend (source of truth)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .gitignore                 # Keeps node_modules/ and .env out of git
├── README.md                  # Full project documentation
└── content.md                 # This report
```

**Total lines of code:**
- Frontend: ~1,850 lines (194 HTML + 1,146 CSS + 734 JavaScript)
- Backend: ~248 lines (199 server.js + 49 Task.js)
- **Grand total: ~2,098 lines of hand-written code**

---

## 15. Agile Execution Summary

Two one-week sprints with planning, daily stand-ups, a review and a retrospective.

### Sprint 1 (Week 1): Foundation & Setup

| Day       | Activity                                                        |
|-----------|-----------------------------------------------------------------|
| Day 1     | Requirements gathering, user story creation, backlog prioritization |
| Day 2     | MongoDB Atlas setup, Mongoose schema design, Task model         |
| Day 3     | GET /tasks and POST /tasks API routes with validation           |
| Day 4     | Frontend HTML structure, CSS design system, board layout        |
| Day 5     | Create task modal, toast notifications, skeleton loading        |
| Review    | Working database, GET/POST APIs testable, static UI with creation flow |
| Retro     | Discuss what went well, improvements for Sprint 2               |

### Sprint 2 (Week 2): Integration & Delivery

| Day       | Activity                                                        |
|-----------|-----------------------------------------------------------------|
| Day 1     | PATCH /tasks/:id with progress auto-sync, DELETE /tasks/:id    |
| Day 2     | Frontend integration: moveTask(), delete with confirmation      |
| Day 3     | Drag-and-drop implementation, progress slider with debounce     |
| Day 4     | Live polling, name prompt, avatar system, overall progress bar  |
| Day 5     | Responsive polish, bug fixes, deployment to Render.com          |
| Review    | Full-stack integration complete, deployed to production         |
| Retro     | Lessons learned, future improvement ideas                       |

**Responsibility:** Individual project — Harshilkumar (all roles: Product Owner, Scrum Master, Developer, Tester).

---

## 16. Deployment

### Platform: Render.com (Free Tier)
- **Service Type:** Web Service
- **Runtime:** Node
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Instance Type:** Free

### Database: MongoDB Atlas (Free M0 Cluster)
- Cloud-hosted MongoDB with auto-scaling
- Network access: `0.0.0.0/0` (allow all IPs for Render)
- Connection via `MONGODB_URI` environment variable in Render dashboard

### Live URL: [https://trello-1-848v.onrender.com](https://trello-1-848v.onrender.com)

> **Note:** Render free tier spins down after 15 minutes of inactivity. First request after idle may take 30–50 seconds to wake up.

---

## 17. Future Improvements

- **User Authentication:** Add signup/login system with JWT tokens
- **Task Assignment:** Optional `assigned_to` field and assignee filters
- **Search, Filters & Pagination:** Find tasks by title, status, or date
- **In-place Card Editing:** Edit task title/description directly on the card
- **Task Reordering:** Drag to reorder within a column (priority ordering)
- **Real-time Updates:** Replace polling with WebSocket or Server-Sent Events
- **File Attachments:** Attach files/images to tasks
- **Activity Log:** Track who moved/edited/deleted tasks and when
- **Email Notifications:** Notify assignees when tasks are updated

---

## 18. Conclusion

Mini-Trello demonstrates a complete full-stack Kanban board application built with modern web technologies. The project successfully implements core task management features — create, view, move, delete, and track progress — through a clean RESTful API architecture. Additional features include a Board/Table view toggle for switching between Kanban and numbered list views, and a Dark/Light mode toggle with localStorage persistence. The Vanilla JavaScript frontend with a custom glassmorphism design system proves that premium UI experiences are achievable without heavy frameworks. The project was developed following Agile/Scrum methodology across two one-week sprints, delivering a production-ready application deployed on Render.com with a MongoDB Atlas database.

---

**Prepared by:** Harshilkumar  
**Enrollment:** (fill your enrollment number)  
**Semester:** 7th  
**Date:** September 2026  
