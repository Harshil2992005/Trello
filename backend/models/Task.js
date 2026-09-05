// =============================================
// Mini-Trello — Task Model (MongoDB schema)
// =============================================

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // task name (required by backend — duplicated frontend check)
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    // task details (optional)
    description: {
      type: String,
      default: "",
      trim: true
    },
    // only these 3 statuses are allowed — matches the board columns
    status: {
      type: String,
      enum: {
        values: ["todo", "in_progress", "done"],
        message: "{VALUE} is not a valid status"
      },
      default: "todo"
    },
    // progress percentage (0-100), mainly for "In Progress" tasks
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  {
    timestamps: true // adds createdAt + updatedAt automatically
  }
);

module.exports = mongoose.model("Task", taskSchema);