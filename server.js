import express from "express"
import cors from "cors"
import sqlite3 from "sqlite3"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Database setup
const dbPath = join(__dirname, "tasks.db")
const db = new sqlite3.Database(dbPath)

// Valid task statuses
const VALID_STATUSES = ["not-started", "in-progress", "done", "backlog"]

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'backlog',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Seed 4 default backlog tasks if table is empty
  db.get('SELECT COUNT(*) as count FROM tasks', (err, row) => {
    if (!err && row.count === 0) {
      const seedTasks = [
        { title: 'Welcome to Kanban!', description: 'This is your first task. Drag me around!', status: 'backlog' },
        { title: 'Add a task', description: 'Click the add icon to add a task to the board.', status: 'backlog' },
        { title: 'Try editing a task', description: 'Click the edit icon on a card to update it. Also need to fix API to update task status.', status: 'backlog' },
        { title: 'Delete a task', description: 'Click the trash icon to remove a task from the board.', status: 'backlog' },
      ];
      const stmt = db.prepare('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)');
      seedTasks.forEach(task => {
        stmt.run([task.title, task.description, task.status]);
      });
      stmt.finalize();
    }
  });
})

// API 1: Create new task
app.post("/api/tasks", (req, res) => {
  const { title, description, status = "backlog" } = req.body
  
  // Validation
  if (!title) {
    return res.status(400).json({ error: "Title is required" })
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Valid statuses are: " + VALID_STATUSES.join(", "),
    })
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, status) 
    VALUES (?, ?, ?)
  `)

  stmt.run([title, description, status], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to create task" })
    }

    // Return the created task
    db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Failed to retrieve created task" })
      }
      res.status(201).json(row)
    })
  })

  stmt.finalize()
})

// API 2: Update task status
app.put("/api/tasks/:id/status", (req, res) => {
  const { id } = req.params
  const { status } = req.body

  // Validation
  if (!status) {
    return res.status(400).json({ error: "Status is required" })
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Valid statuses are: " + VALID_STATUSES.join(", "),
    })
  }
  
  // TODO: Implement update task status functionality
  const stmt = db.prepare(`
    UPDATE tasks 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)

  stmt.run([status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to update task status" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Return the updated task
    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: "Failed to retrieve updated task" })
      }
      res.json(row)
    })
  })

  stmt.finalize()
})

// API 3: Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to retrieve tasks" })
    }
    res.json(rows)
  })
})

// API 4: Get tasks by status
app.get("/api/tasks/status/:status", (req, res) => {
  const { status } = req.params

  // Validation
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Valid statuses are: " + VALID_STATUSES.join(", "),
    })
  }

  db.all("SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC", [status], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to retrieve tasks" })
    }
    res.json(rows)
  })
})

// Additional API: Update entire task (bonus)
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params
  const { title, description, status } = req.body

  // TODO: Add Validation

  const stmt = db.prepare(`
    UPDATE tasks 
    SET title = ?, description = ?, status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)

  stmt.run([title, description, status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to update task" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    // TODO: Return the updated task
  })

  stmt.finalize()
})

// Additional API: Delete task (bonus)
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params

  const stmt = db.prepare("DELETE FROM tasks WHERE id = ?")

  stmt.run([id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete task" })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json({ message: "Task deleted successfully" })
  })

  stmt.finalize()
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down server...")
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err)
    } else {
      console.log("Database connection closed.")
    }
    process.exit(0)
  })
})
