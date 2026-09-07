// =============================================
// Mini-Trello — Backend Server (Node.js + Express + MongoDB)
//
// Same API endpoints used by the frontend:
//   GET    /tasks       -> return all tasks
//   POST   /tasks       -> create a new task
//   PATCH  /tasks/:id   -> update a task (e.g. move column)
//   DELETE /tasks/:id   -> delete a task
// =============================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const Task = require("./models/Task");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------- MongoDB connection ----------
// The connection string lives in backend/.env (MONGODB_URI).
// If no .env exists, fall back to a local MongoDB instance.
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mini-trello";

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB connection error:", err.message));

// ---------- API ROUTES ----------

// 1) GET /tasks -> return all tasks, newest first
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) POST /tasks -> create a new task (title + createdBy required)
app.post("/tasks", async (req, res) => {
  try {
    // server-side validation: title must not be empty
    const title = (req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // server-side validation: createdBy (who created the task) must not be empty
    const createdBy = (req.body.createdBy || "").trim();
    if (!createdBy) {
      return res.status(400).json({ error: "createdBy is required" });
    }

    const status = req.body.status || "todo";
    if (!["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const task = new Task({
      title,                                  // trimmed title
      description: req.body.description || "",
      status,
      createdBy
    });

    const savedTask = await task.save();     // save to MongoDB
    res.status(201).json(savedTask);         // 201 = created
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3) PATCH /tasks/:id -> update a task (title, description or status)
app.patch("/tasks/:id", async (req, res) => {
  try {
    // build the update object from the fields that were sent
    const updates = {};

    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      updates.title = title;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description;
    }

    if (req.body.status !== undefined) {
      if (!["todo", "in_progress", "done"].includes(req.body.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updates.status = req.body.status;
    }

    if (req.body.progress !== undefined) {
      const progress = Number(req.body.progress);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ error: "Progress must be a number between 0 and 100" });
      }
      updates.progress = Math.round(progress);
    }

    // auto-sync progress with the column the task is moved into
    if (updates.status) {
      if (updates.status === "todo") {
        updates.progress = 0;
      } else if (updates.status === "done") {
        updates.progress = 100;
      } else if (updates.status === "in_progress" && updates.progress === undefined) {
        // keep existing progress if it already has one, otherwise start at 0
        const existing = await Task.findById(req.params.id, "progress");
        updates.progress = existing && existing.progress != null ? existing.progress : 0;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,        // which task (from the URL)
      updates,              // only the fields that were sent
      { new: true, runValidators: true }  // return updated task + validate
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    res.status(500).json({ error: err.message });
  }
});

// 4) DELETE /tasks/:id -> delete a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    res.status(500).json({ error: err.message });
  }
});

// ---------- Root route (serves the frontend) ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- 404 handler for unknown routes ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------- Central error handler ----------
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ---------- Start the server ----------
const server = app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});

// ---------- Graceful shutdown (Ctrl+C) ----------
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  server.close(() => {
    console.log("Server closed. Bye!");
    process.exit(0);
  });
});