/**
 * server.js
 * 
 * Main Entry Point for the Express API Server.
 * Configures Middlewares, connects to MongoDB via Mongoose, defines the Todo Schema,
 * and sets up the primary API endpoints required for managing our tasks.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize the Express framework
const app = express();

// Define the server port (5000 as per technical requirements)
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS).
// This is critical because our React app runs on port 3000 (a different origin/port) 
// and needs to fetch data from our backend running on port 5000.
app.use(cors());

// Express Built-in Middleware for JSON Parsing.
// This parses incoming request payloads with content-type "application/json" 
// and puts the parsed object into 'req.body'. Without it, 'req.body' will be undefined.
app.use(express.json());

// Database connection string for local MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_db';

console.log('Connecting to local MongoDB instance...');
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('==================================================');
    console.log('SUCCESS: Connected to MongoDB Database ("todo_db")');
    console.log('==================================================');
  })
  .catch((err) => {
    console.error('FATAL: Database connection failed:');
    console.error(err);
    process.exit(1);
  });

// ==========================================
// MONGOOSE SCHEMA & MODEL DEFINITION
// ==========================================

// Define the schema representing the fields allowed inside a MongoDB document
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A task title is required to create a To-Do.']
  },
  description: {
    type: String,
    default: '' // Default to empty string if no description is provided
  },
  isCompleted: {
    type: Boolean,
    default: false // Task starts as uncompleted by default
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'], // Enforce priority choices
    default: 'Medium'
  }
}, {
  // Automatically creates 'createdAt' and 'updatedAt' fields in our documents
  timestamps: true 
});

// Compile the schema into a Mongoose model named 'Todo'
const Todo = mongoose.model('Todo', todoSchema);

// ==========================================
// REST API ENDPOINTS
// ==========================================

/**
 * 1. GET /api/todos
 * Fetch all tasks from MongoDB.
 * Used by React frontend to load current tasks on startup and refresh operations.
 */
app.get('/api/todos', async (req, res) => {
  console.log('GET /api/todos - Fetching all tasks...');
  try {
    // Query MongoDB for all documents, sorted by creation date (newest first)
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    console.error('Error in GET /api/todos:', error.message);
    res.status(500).json({ error: 'Failed to retrieve tasks from database.' });
  }
});

/**
 * 2. POST /api/todos
 * Create a new task.
 * Used by React frontend when submitting the task creation form.
 */
app.post('/api/todos', async (req, res) => {
  console.log('POST /api/todos - Creating new task:', req.body);
  try {
    const { title, description, priority } = req.body;

    // Validate that title is not empty or whitespaces
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    // Instantiate a new Todo model instance
    const newTodo = new Todo({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      isCompleted: false // Defaults to false
    });

    // Save the document to MongoDB
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error in POST /api/todos:', error.message);
    res.status(500).json({ error: 'Failed to create new task in database.' });
  }
});

/**
 * 3. PUT /api/todos/:id
 * Toggle the completion status (isCompleted) of a task.
 * Used by React frontend when ticking a checkbox/clicking card completion.
 */
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`PUT /api/todos/${id} - Toggling task completion status...`);

  try {
    // Validate Mongo ObjectID syntax
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Task ID format.' });
    }

    // Retrieve task from database
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    // Toggle the boolean completion status
    todo.isCompleted = !todo.isCompleted;

    // Save the changes
    const updatedTodo = await todo.save();
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error(`Error in PUT /api/todos/${id}:`, error.message);
    res.status(500).json({ error: 'Failed to toggle task completion status.' });
  }
});

/**
 * 4. DELETE /api/todos
 * Mass delete option. Deletes all tasks from MongoDB.
 * Used by React frontend "Clear All Tasks" button.
 */
app.delete('/api/todos', async (req, res) => {
  console.log('DELETE /api/todos - Deleting all tasks...');
  try {
    // Run deleteMany on collection to wipe all tasks
    const result = await Todo.deleteMany({});
    res.status(200).json({
      message: 'All tasks deleted successfully.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in DELETE /api/todos:', error.message);
    res.status(500).json({ error: 'Failed to clear tasks from database.' });
  }
});

// Start listening for traffic
app.listen(PORT, () => {
  console.log(`Express Server actively running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api/todos`);
});
