# Task Management Backend API

A Node.js backend service for task management with SQLite database.

## Features

- ✅ Create new tasks with title and description
- ✅ Update task status (not started, in progress, done, backlog)
- ✅ Read all tasks
- ✅ Read tasks by status/column
- ✅ SQLite database for data persistence
- ✅ CORS enabled for frontend integration
- ✅ Input validation and error handling

## API Endpoints

### 1. Create Task
\`\`\`
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "status": "not started" // optional, defaults to "not started"
}
\`\`\`

### 2. Update Task Status
\`\`\`
PUT /api/tasks/:id/status
Content-Type: application/json

{
  "status": "in progress"
}
\`\`\`

### 3. Get All Tasks
\`\`\`
GET /api/tasks
\`\`\`

### 4. Get Tasks by Status
\`\`\`
GET /api/tasks/status/:status
\`\`\`

Valid statuses: `not started`, `in progress`, `done`, `backlog`

### Additional Endpoints

- `PUT /api/tasks/:id` - Update entire task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/health` - Health check

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the server:
\`\`\`bash
npm start
\`\`\`

For development with auto-reload:
\`\`\`bash
npm run dev
\`\`\`

3. Test the API:
\`\`\`bash
npm test
\`\`\`

## Database

The application uses SQLite with the following schema:

\`\`\`sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not started',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Usage Examples

### Create a task
\`\`\`bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description"}'
\`\`\`

### Update task status
\`\`\`bash
curl -X PUT http://localhost:3001/api/tasks/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in progress"}'
\`\`\`

### Get all tasks
\`\`\`bash
curl http://localhost:3001/api/tasks
\`\`\`

### Get tasks by status
\`\`\`bash
curl http://localhost:3001/api/tasks/status/done
\`\`\`

## Environment Variables

- `PORT` - Server port (default: 3001)

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
