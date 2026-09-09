// =============================================
// Mini-Trello — Frontend (Vanilla JS)
// All fetch() calls and API endpoints are preserved.
// =============================================

const API = "";

// ---------- DOM References ----------
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const titleError = document.getElementById("titleError");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const nameModal = document.getElementById("nameModal");
const nameForm = document.getElementById("nameForm");
const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");

const toastContainer = document.getElementById("toastContainer");
const skeletonTemplate = document.getElementById("skeletonCard");

const columns = {
  todo: document.getElementById("todoCards"),
  in_progress: document.getElementById("inProgressCards"),
  done: document.getElementById("doneCards")
};

const badges = {
  todo: document.getElementById("todoBadge"),
  in_progress: document.getElementById("inProgressBadge"),
  done: document.getElementById("doneBadge")
};

const emptyStates = {
  todo: document.getElementById("todoEmpty"),
  in_progress: document.getElementById("inProgressEmpty"),
  done: document.getElementById("doneEmpty")
};

// View toggle references
const boardViewBtn = document.getElementById("boardViewBtn");
const tableViewBtn = document.getElementById("tableViewBtn");
const boardSection = document.querySelector(".board");
const tableSection = document.getElementById("taskTableView");
const taskTableBody = document.getElementById("taskTableBody");
const tableEmpty = document.getElementById("tableEmpty");
const tableCount = document.getElementById("tableCount");
let currentView = "board"; // "board" or "table"

// ---------- THEME TOGGLE (Light / Dark) ----------
const themeToggle = document.getElementById("themeToggle");

function getStoredTheme() {
  return localStorage.getItem("mtTheme");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mtTheme", theme);
}

// Apply saved theme immediately (before first paint to avoid flash)
var savedTheme = getStoredTheme();
if (savedTheme) {
  applyTheme(savedTheme);
}

themeToggle.addEventListener("click", function () {
  var current = document.documentElement.getAttribute("data-theme");
  var next = current === "dark" ? "light" : "dark";
  applyTheme(next);
});

let pendingDeleteId = null;
// task ids whose slider is being dragged right now
// (protected from being re-built by unrelated re-renders)
const activeSliders = new Set();

// ---------- API HELPER (fetch wrapper with error handling) ----------
async function apiFetch(url, options) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

// ---------- NAME HELPERS ("who am I") ----------
// Returns the logged-in name from localStorage, or null.
function getUserName() {
  var name = localStorage.getItem("mtUserName");
  return name ? name.trim() : null;
}

// Colors for the avatar badge, picked deterministically from the name.
var AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#ef4444", "#3b82f6"
];

function avatarColorFor(name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// Short date like "7 Sept" ("7 Sep 2026" if it's not this year).
function formatShortDate(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var out = d.getDate() + " " + months[d.getMonth()];
  if (d.getFullYear() !== new Date().getFullYear()) {
    out += " " + d.getFullYear();
  }
  return out;
}

// Show the "who am I" modal on first visit (name not in localStorage yet).
function ensureUserName() {
  if (getUserName()) return;
  setTimeout(function () { nameInput.focus(); }, 100);
  // block clicking the backdrop so the name can't be skipped accidentally
  nameModal.addEventListener("click", function (e) {
    if (e.target === nameModal) nameInput.focus();
  });
  openModal(nameModal);
}

nameForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var name = nameInput.value.trim();
  if (!name) {
    nameError.textContent = "Please enter your name";
    nameError.classList.add("visible");
    nameInput.classList.add("input-error");
    nameInput.focus();
    return;
  }
  localStorage.setItem("mtUserName", name);
  closeModal(nameModal);
  loadTasks();
});

// ---------- TOAST NOTIFICATIONS ----------
function showToast(message, type) {
  type = type || "info";
  const icons = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  toast.innerHTML = icons[type] + "<span>" + message + "</span>";
  toastContainer.appendChild(toast);

  setTimeout(function () {
    toast.classList.add("removing");
    toast.addEventListener("animationend", function () { toast.remove(); });
  }, 2800);
}

// ---------- MODAL HELPERS ----------
function openModal(modal) {
  modal.classList.add("show");
}

function closeModal(modal) {
  modal.classList.remove("show");
}

// Open create-task modal
addTaskBtn.addEventListener("click", function () {
  clearValidation();
  taskForm.reset();
  openModal(taskModal);
  setTimeout(function () { taskTitle.focus(); }, 100);
});

// Close create-task modal
closeModalBtn.addEventListener("click", function () { closeModal(taskModal); });
cancelModalBtn.addEventListener("click", function () { closeModal(taskModal); });

// Close modals on backdrop click
taskModal.addEventListener("click", function (e) {
  if (e.target === taskModal) closeModal(taskModal);
});
deleteModal.addEventListener("click", function (e) {
  if (e.target === deleteModal) closeDeleteModal();
});

// Close modals on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal(taskModal);
    closeDeleteModal();
  }
});

// ---------- INLINE VALIDATION ----------
function clearValidation() {
  taskTitle.classList.remove("input-error");
  titleError.textContent = "";
  titleError.classList.remove("visible");
}

taskTitle.addEventListener("input", function () {
  if (taskTitle.value.trim() !== "") {
    clearValidation();
  }
});

// ---------- POST /tasks : create a new task ----------
taskForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (taskTitle.value.trim() === "") {
    titleError.textContent = "Title is required";
    titleError.classList.add("visible");
    taskTitle.classList.add("input-error");
    taskTitle.focus();
    return;
  }

  clearValidation();

  try {
    await apiFetch(API + "/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle.value,
        description: taskDescription.value,
        createdBy: getUserName() || "Unknown"
      })
    });

    taskForm.reset();
    closeModal(taskModal);
    showToast("Task created successfully", "success");
    loadTasks();
  } catch (err) {
    showToast("Failed to save task: " + err.message, "error");
  }
});

// ---------- DELETE MODAL ----------
function openDeleteModal(id) {
  pendingDeleteId = id;
  openModal(deleteModal);
}

function closeDeleteModal() {
  pendingDeleteId = null;
  closeModal(deleteModal);
}

cancelDeleteBtn.addEventListener("click", closeDeleteModal);

confirmDeleteBtn.addEventListener("click", async function () {
  if (!pendingDeleteId) return;

  try {
    await apiFetch(API + "/tasks/" + pendingDeleteId, {
      method: "DELETE"
    });

    closeDeleteModal();
    showToast("Task deleted", "error");
    loadTasks();
  } catch (err) {
    closeDeleteModal();
    showToast("Failed to delete task: " + err.message, "error");
  }
});

// ---------- PATCH /tasks/:id : move a task to another column ----------
// Auto-syncs progress with status and persists via PATCH.
async function moveTask(id, newStatus, currentProgress) {
  var progress = currentProgress != null ? currentProgress : 0;

  // auto-sync progress with the column
  if (newStatus === "todo") {
    progress = 0;
  } else if (newStatus === "done") {
    progress = 100;
  } else if (newStatus === "in_progress") {
    // keep existing progress if it has one, otherwise start at 0
    progress = (currentProgress != null && currentProgress > 0) ? currentProgress : 0;
  }

  var payload = { status: newStatus, progress: progress };

  try {
    await apiFetch(API + "/tasks/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    showToast("Task moved", "success");
    loadTasks();
  } catch (err) {
    showToast("Failed to move task: " + err.message, "error");
  }
}

// ---------- PATCH /tasks/:id : save a task's progress percentage ----------
async function saveProgress(id, value) {
  try {
    await apiFetch(API + "/tasks/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: value })
    });
  } catch (err) {
    showToast("Failed to save progress: " + err.message, "error");
  }
}

// ---------- SKELETON LOADING ----------
function showSkeletons() {
  var keys = ["todo", "in_progress", "done"];
  keys.forEach(function (key) {
    columns[key].innerHTML = "";
    emptyStates[key].classList.remove("visible");
    for (var i = 0; i < 2; i++) {
      columns[key].appendChild(skeletonTemplate.content.cloneNode(true));
    }
  });
}

// ---------- GET /tasks : load all tasks from backend and show them ----------
async function loadTasks() {
  var tasks;
  try {
    tasks = await apiFetch(API + "/tasks");
  } catch (err) {
    // remove skeletons so the board is not stuck loading
    columns.todo.innerHTML = "";
    columns.in_progress.innerHTML = "";
    columns.done.innerHTML = "";
    badges.todo.textContent = "0";
    badges.in_progress.textContent = "0";
    badges.done.textContent = "0";
    var of = document.getElementById("overallFill");
    var ov = document.getElementById("overallValue");
    if (of) of.style.width = "0%";
    if (ov) ov.textContent = "0%";
    showToast("Failed to load tasks: " + err.message, "error");
    return;
  }
  renderBoard(tasks);
}

// Render the board from a tasks array (shared by loadTasks + polls)
function renderBoard(tasks) {
  // remember cards with an active slider so a re-render does not
  // interrupt an ongoing progress drag
  var liveNodes = {};
  [columns.todo, columns.in_progress, columns.done].forEach(function (col) {
    col.querySelectorAll(".card[data-id]").forEach(function (cardEl) {
      liveNodes[cardEl.getAttribute("data-id")] = cardEl;
    });
  });

  columns.todo.innerHTML = "";
  columns.in_progress.innerHTML = "";
  columns.done.innerHTML = "";

  var counts = { todo: 0, in_progress: 0, done: 0 };
  var totalProgress = 0;

  tasks.forEach(function (task) {
    // keep the live DOM node mid-drag, otherwise rebuild the card
    if (activeSliders.has(task._id) && liveNodes[task._id]) {
      columns[task.status].appendChild(liveNodes[task._id]);
    } else {
      columns[task.status].appendChild(makeCard(task));
    }
    counts[task.status]++;
    var p = Number(task.progress);
    totalProgress += isNaN(p) ? 0 : p;
  });

  // Update badges
  badges.todo.textContent = counts.todo;
  badges.in_progress.textContent = counts.in_progress;
  badges.done.textContent = counts.done;

  // Update overall progress = average of ALL tasks' progress values
  var overall = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
  var overallFill = document.getElementById("overallFill");
  var overallValue = document.getElementById("overallValue");
  if (overallFill) overallFill.style.width = overall + "%";
  if (overallValue) overallValue.textContent = overall + "%";

  // Show/hide empty states
  emptyStates.todo.classList.toggle("visible", counts.todo === 0);
  emptyStates.in_progress.classList.toggle("visible", counts.in_progress === 0);
  emptyStates.done.classList.toggle("visible", counts.done === 0);

  lastPollSignature = tasks.map(function (t) {
    return t._id + "|" + t.status + "|" + t.progress + "|" + t.title + "|" + t.createdBy + "|" + t.createdAt;
  }).join("~");

  // also update table if it's visible
  if (currentView === "table") {
    renderTable(tasks);
  }
}

// ---------- VIEW TOGGLE (Board / Table) ----------
boardViewBtn.addEventListener("click", function () {
  if (currentView === "board") return;
  currentView = "board";
  boardViewBtn.classList.add("active");
  tableViewBtn.classList.remove("active");
  boardSection.style.display = "";
  tableSection.style.display = "none";
});

tableViewBtn.addEventListener("click", function () {
  if (currentView === "table") return;
  currentView = "table";
  tableViewBtn.classList.add("active");
  boardViewBtn.classList.remove("active");
  boardSection.style.display = "none";
  tableSection.style.display = "";
  // render table with current data
  renderTableFromCache();
});

// Store tasks cache for table view
var cachedTasks = [];

function renderTableFromCache() {
  renderTable(cachedTasks);
}

// ---------- RENDER TABLE ----------
function renderTable(tasks) {
  cachedTasks = tasks || [];
  taskTableBody.innerHTML = "";

  if (cachedTasks.length === 0) {
    tableEmpty.classList.add("visible");
    tableCount.textContent = "0 tasks";
    return;
  }

  tableEmpty.classList.remove("visible");
  tableCount.textContent = cachedTasks.length + " task" + (cachedTasks.length !== 1 ? "s" : "");

  var statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done"
  };

  cachedTasks.forEach(function (task, index) {
    var tr = document.createElement("tr");

    // #
    var tdNum = document.createElement("td");
    tdNum.className = "col-num";
    tdNum.textContent = index + 1;
    tr.appendChild(tdNum);

    // Title
    var tdTitle = document.createElement("td");
    tdTitle.className = "col-title";
    tdTitle.textContent = task.title;
    tr.appendChild(tdTitle);

    // Description
    var tdDesc = document.createElement("td");
    tdDesc.className = "col-desc";
    tdDesc.textContent = task.description || "—";
    tr.appendChild(tdDesc);

    // Status badge
    var tdStatus = document.createElement("td");
    tdStatus.className = "col-status";
    var badge = document.createElement("span");
    badge.className = "status-badge status-" + task.status;
    badge.textContent = statusLabels[task.status] || task.status;
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // Created By
    var tdBy = document.createElement("td");
    tdBy.className = "col-by";
    tdBy.textContent = task.createdBy || "Unknown";
    tr.appendChild(tdBy);

    // Date
    var tdDate = document.createElement("td");
    tdDate.className = "col-date";
    tdDate.textContent = formatShortDate(task.createdAt);
    tr.appendChild(tdDate);

    taskTableBody.appendChild(tr);
  });
}

// ---------- DRAG & DROP ----------
var draggedTaskId = null;
var draggedOriginalStatus = null;
var draggedProgress = null;

function setupDragEvents(card, task) {
  card.setAttribute("draggable", "true");

  card.addEventListener("dragstart", function (e) {
    draggedTaskId = task._id;
    draggedOriginalStatus = task.status;
    draggedProgress = task.progress;
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task._id);
  });

  card.addEventListener("dragend", function () {
    card.classList.remove("dragging");
    draggedTaskId = null;
    draggedOriginalStatus = null;
    draggedProgress = null;
    document.querySelectorAll(".column").forEach(function (col) {
      col.classList.remove("drag-over");
    });
  });
}

// Column drag-over events
document.querySelectorAll(".column").forEach(function (col) {
  col.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    col.classList.add("drag-over");
  });

  col.addEventListener("dragleave", function (e) {
    if (!col.contains(e.relatedTarget)) {
      col.classList.remove("drag-over");
    }
  });

  col.addEventListener("drop", function (e) {
    e.preventDefault();
    col.classList.remove("drag-over");
    var targetStatus = col.getAttribute("data-status");
    if (draggedTaskId && targetStatus && targetStatus !== draggedOriginalStatus) {
      moveTask(draggedTaskId, targetStatus, draggedProgress);
    }
  });
});

// ---------- Build progress slider control for a task ----------
function makeProgressControl(task) {
  var wrapper = document.createElement("div");
  wrapper.className = "progress-control";
  wrapper.setAttribute("data-taskid", task._id);

  var row = document.createElement("div");
  row.className = "progress-row";

  var label = document.createElement("span");
  label.className = "progress-label";
  label.textContent = "Progress";

  var value = document.createElement("span");
  value.className = "progress-value";
  value.textContent = (task.progress || 0) + "%";

  var slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 100;
  slider.step = 1;
  slider.value = task.progress || 0;
  slider.className = "progress-slider";

  // optimistic UI update during drag — no re-render, no server call
  var debounceTimer = null;
  slider.addEventListener("input", function () {
    activeSliders.add(task._id);
    value.textContent = slider.value + "%";
    slider.style.setProperty("--progress", slider.value + "%");
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      saveProgress(task._id, Number(slider.value));
    }, 300);
  });

  // slider released -> save immediately + stop protecting this card
  slider.addEventListener("change", function () {
    activeSliders.delete(task._id);
    clearTimeout(debounceTimer);
    saveProgress(task._id, Number(slider.value));
  });

  // don't let dragging the slider drag the whole card
  slider.addEventListener("mousedown", function (e) { e.stopPropagation(); });
  slider.addEventListener("touchstart", function (e) { e.stopPropagation(); });

  row.appendChild(label);
  row.appendChild(value);
  wrapper.appendChild(row);
  wrapper.appendChild(slider);

  return wrapper;
}

// ---------- Build one card element for a task ----------
function makeCard(task) {
  var card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", task._id);

  var title = document.createElement("h3");
  title.textContent = task.title;

  var desc = document.createElement("p");
  desc.textContent = task.description || "";

  card.appendChild(title);
  card.appendChild(desc);

  // Only "In Progress" cards show the progress slider
  if (task.status === "in_progress") {
    card.appendChild(makeProgressControl(task));
  }

  var actions = document.createElement("div");
  actions.className = "card-actions";

  // "Previous" button: move the task back one column
  if (task.status !== "todo") {
    var prev = document.createElement("button");
    prev.className = "btn-prev";
    prev.title = "Move to previous column";
    prev.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
    prev.addEventListener("click", function (e) {
      e.stopPropagation();
      var newStatus = task.status === "done" ? "in_progress" : "todo";
      moveTask(task._id, newStatus, task.progress);
    });
    actions.appendChild(prev);
  }

  // "Next" button: move the task to the next column
  if (task.status !== "done") {
    var next = document.createElement("button");
    next.className = "btn-next";
    next.title = "Move to next column";
    next.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
    next.addEventListener("click", function (e) {
      e.stopPropagation();
      var newStatus = task.status === "todo" ? "in_progress" : "done";
      moveTask(task._id, newStatus, task.progress);
    });
    actions.appendChild(next);
  }

  // "Delete" button
  var del = document.createElement("button");
  del.className = "btn-delete";
  del.title = "Delete task";
  del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  del.addEventListener("click", function (e) {
    e.stopPropagation();
    openDeleteModal(task._id);
  });
  actions.appendChild(del);

  card.appendChild(actions);

  // Mini "footer" row: avatar + creator name on the left, date pill on the right
  var footer = document.createElement("div");
  footer.className = "card-footer";

  var who = document.createElement("div");
  who.className = "card-by";

  var avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = (task.createdBy || "?").charAt(0).toUpperCase();
  avatar.style.background = avatarColorFor(task.createdBy || "?");

  var name = document.createElement("span");
  name.className = "card-author";
  name.textContent = task.createdBy || "Unknown";

  who.appendChild(avatar);
  who.appendChild(name);

  var datePill = document.createElement("span");
  datePill.className = "date-pill";
  datePill.textContent = formatShortDate(task.createdAt);

  footer.appendChild(who);
  footer.appendChild(datePill);
  card.appendChild(footer);

  // Setup drag events
  setupDragEvents(card, task);

  return card;
}

// ---------- LIVE SYNC (Option A: simple polling) ----------
// Re-fetch every 5 seconds; only re-render the board when the data
// actually changed, so a card being dragged isn't yanked out from under
// the mouse on an unrelated poll.
var lastPollSignature = "";

function pollTasks() {
  fetch(API + "/tasks")
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (tasks) {
      if (!tasks) return;
      var signature = tasks.map(function (t) {
        return t._id + "|" + t.status + "|" + t.progress + "|" + t.title + "|" + t.createdBy + "|" + t.createdAt;
      }).join("~");
      if (signature !== lastPollSignature) {
        lastPollSignature = signature;
  renderBoard(tasks);
  cachedTasks = tasks;
      }
    })
    .catch(function () { /* ignore poll errors; next tick retries */ });
}

setInterval(pollTasks, 5000);

// ---------- Show skeletons, then load tasks ----------
showSkeletons();
if (getUserName()) {
  loadTasks();
} else {
  ensureUserName();
}
