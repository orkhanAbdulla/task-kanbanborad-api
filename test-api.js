const BASE_URL = "http://localhost:3001/api"

async function testAPI() {
  console.log("🧪 Testing Task Management API\n")

  try {
    // Test 1: Health check
    console.log("1. Testing health check...")
    const healthResponse = await fetch(`${BASE_URL}/health`)
    const healthData = await healthResponse.json()
    console.log("✅ Health check:", healthData)

    // Test 2: Create a new task
    console.log("\n2. Creating a new task...")
    const createResponse = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Task",
        description: "This is a test task created by the API test",
        status: "not started",
      }),
    })
    const newTask = await createResponse.json()
    console.log("✅ Created task:", newTask)

    // Test 3: Get all tasks
    console.log("\n3. Getting all tasks...")
    const allTasksResponse = await fetch(`${BASE_URL}/tasks`)
    const allTasks = await allTasksResponse.json()
    console.log(`✅ Retrieved ${allTasks.length} tasks`)

    // Test 4: Update task status
    if (newTask.id) {
      console.log("\n4. Updating task status...")
      const updateResponse = await fetch(`${BASE_URL}/tasks/${newTask.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in progress" }),
      })
      const updatedTask = await updateResponse.json()
      console.log("✅ Updated task:", updatedTask)
    }

    // Test 5: Get tasks by status
    console.log("\n5. Getting tasks by status (in progress)...")
    const statusTasksResponse = await fetch(`${BASE_URL}/tasks/status/in progress`)
    const statusTasks = await statusTasksResponse.json()
    console.log(`✅ Retrieved ${statusTasks.length} tasks with status 'in progress'`)

    console.log("\n🎉 All tests completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI()
}

export { testAPI }
