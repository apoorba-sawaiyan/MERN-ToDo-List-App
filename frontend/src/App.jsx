/**
 * App.jsx
 * 
 * Main Frontend Component for the TaskGlass Application.
 * Implements standard React Hooks (useState, useEffect) to manage UI state,
 * triggers async Fetch API calls to interact with the backend server at port 5000,
 * and renders a glassmorphic dashboard container.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, ListTodo } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/todos';

function App() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Holds the array of task objects fetched from the database
  const [todos, setTodos] = useState([]);
  
  // Form input field states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  
  // User feedback states (loading spinners and error banners)
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // ==========================================
  // DATA INTERACTIONS (API CLIENT FLOWS)
  // ==========================================

  /**
   * DATA FLOW: FETCH TASKS (GET)
   * 1. The component mounts and triggers this useEffect hook once.
   * 2. useEffect calls fetchTodos().
   * 3. fetchTodos() makes an HTTP GET request to `http://localhost:5000/api/todos`.
   * 4. The Express API receives the request in 'server.js', runs 'Todo.find()', and queries MongoDB.
   * 5. Express responds with a JSON array of tasks (Status 200).
   * 6. Frontend receives the response, parses the JSON, and updates the 'todos' state.
   * 7. The state change triggers a UI re-render, drawing the task cards.
   */
  useEffect(() => {
    fetchTodos();
  }, []);

  // HTTP GET: Fetch all tasks
  const fetchTodos = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to retrieve task list from server.');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('Fetch error details:', err.message);
      setErrorMessage('Could not connect to the database server. Make sure MongoDB and backend are running.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * DATA FLOW: CREATE TASK (POST)
   * 1. User enters form values and clicks the "Add New Task" submit button.
   * 2. Form submit handler calls addTodo(e) and prevents default browser page refresh.
   * 3. addTodo() executes an HTTP POST request to `http://localhost:5000/api/todos`, 
   *    passing title, description, and priority serialized as a JSON string in the request body.
   * 4. Express uses 'express.json()' middleware to parse the body and maps fields into a new Todo model instance.
   * 5. Express runs 'newTodo.save()', triggering MongoDB to write the document and assign a unique '_id'.
   * 6. Express returns the saved document with a Status 201 (Created).
   * 7. Frontend receives the saved document and prepends it to our local 'todos' array state.
   * 8. React updates the UI to show the new card at the top, and form fields are cleared.
   */
  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a task title.');
      return;
    }

    setErrorMessage(null);
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority: priority
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create new task.');
      }

      const newTodoItem = await response.json();
      
      // Update local state by prepending the newly created todo item
      setTodos((prevTodos) => [newTodoItem, ...prevTodos]);
      
      // Reset form fields
      setTitle('');
      setDescription('');
      setPriority('Medium');
    } catch (err) {
      console.error('Create task error details:', err.message);
      setErrorMessage(err.message || 'Could not save task to database.');
    }
  };

  /**
   * DATA FLOW: TOGGLE COMPLETION (PUT)
   * 1. User clicks the checkbox on a task card.
   * 2. Checkbox triggers onChange handler, executing toggleTodoStatus(id) with the task's Mongo '_id'.
   * 3. toggleTodoStatus() fires an HTTP PUT request to `http://localhost:5000/api/todos/:id`.
   * 4. Express extracts the id parameter, queries the document via 'Todo.findById()', 
   *    inverts its 'isCompleted' boolean property, and runs '.save()' to update MongoDB.
   * 5. Express responds with the updated task document (Status 200).
   * 6. Frontend maps over the local 'todos' state array: if the _id matches, it replaces it 
   *    with the updated version returned from Express; other tasks remain untouched.
   * 7. The state update re-renders the specific card, immediately toggling opacity and line-through styles.
   */
  const toggleTodoStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to update task completion status.');
      }

      const updatedTodo = await response.json();

      // Update local state by swapping in the newly updated todo item
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
      );
    } catch (err) {
      console.error('Toggle status error details:', err.message);
      setErrorMessage('Could not update completion status in the database.');
    }
  };

  /**
   * DATA FLOW: CLEAR ALL TASKS (DELETE)
   * 1. User clicks the "Clear All Tasks" button.
   * 2. Confirmation modal appears; if user clicks "OK", clearAllTodos() is executed.
   * 3. clearAllTodos() fires an HTTP DELETE request to `http://localhost:5000/api/todos`.
   * 4. Express receives the delete request and runs Mongoose 'Todo.deleteMany({})'.
   * 5. MongoDB clears all documents out of the collection.
   * 6. Express returns a success confirmation message (Status 200).
   * 7. Frontend clears the 'todos' local state array to [], clearing the UI listing.
   */
  const clearAllTodos = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to clear all tasks from the database? This cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to clear all tasks from database.');
      }

      // Empty the React todo state to immediately clear cards from UI
      setTodos([]);
    } catch (err) {
      console.error('Clear tasks error details:', err.message);
      setErrorMessage('Could not delete tasks from database.');
    }
  };

  // State metrics calculations
  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.isCompleted).length;

  return (
    <>
      {/* Background glow containers for premium glassmorphism theme depth */}
      <div className="bg-glow-container">
        <div className="bg-blob blob-blue"></div>
        <div className="bg-blob blob-pink"></div>
        <div className="bg-blob blob-purple"></div>
      </div>

      <div className="app-container">
        <header>
          <h1>TaskGlass Dashboard</h1>
          <p className="subtitle">MERN Stack To-Do List Application & Excel Integration</p>
        </header>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="alert-banner error" id="error-banner">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Form Card */}
        <form onSubmit={addTodo} className="todo-form" id="todo-creation-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              className="input-field"
              placeholder="e.g., Run Legacy Data Migrations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description (Optional)</label>
            <textarea
              id="task-desc"
              className="textarea-field"
              placeholder="Provide implementation details, target deadlines, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">Priority Level</label>
              <select
                id="task-priority"
                className="select-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority (Green Badge)</option>
                <option value="Medium">Medium Priority (Amber Badge)</option>
                <option value="High">High Priority (Red Badge)</option>
              </select>
            </div>

            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" id="btn-add-task">
                <Plus size={18} />
                Add New Task
              </button>
            </div>
          </div>
        </form>

        {/* Metrics Status Bar */}
        <div className="stats-bar" id="app-metrics-bar">
          <div className="stat-item">
            <span>Pending Tasks:</span>
            <span className="stat-value" id="count-pending">{totalTasks - completedTasks}</span>
          </div>
          <div className="stat-item">
            <span>Completed:</span>
            <span className="stat-value" id="count-completed">{completedTasks}</span>
          </div>
          <div className="stat-item">
            <span>Total Tasks:</span>
            <span className="stat-value" id="count-total">{totalTasks}</span>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="empty-state" id="loading-spinner">
            <ListTodo size={42} className="animate-spin" />
            <p>Fetching database tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          // Empty State view
          <div className="empty-state" id="empty-state-view">
            <ListTodo size={42} />
            <p>Your task manager is currently empty. Create a task above or run the Excel database seed script!</p>
          </div>
        ) : (
          // Tasks Card Grid
          <div className="todo-list" id="todo-cards-grid">
            {todos.map((todo) => (
              <div
                key={todo._id}
                id={`todo-card-${todo._id}`}
                className={`todo-card ${todo.isCompleted ? 'completed' : ''} priority-${todo.priority}`}
              >
                {/* Checkbox Trigger Toggle */}
                <div className="todo-checkbox-wrapper">
                  <input
                    id={`checkbox-toggle-${todo._id}`}
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.isCompleted}
                    onChange={() => toggleTodoStatus(todo._id)}
                    title="Toggle task completion status"
                  />
                </div>

                {/* Details Section */}
                <div className="todo-details">
                  <div className="todo-header-row">
                    <span className="todo-title">{todo.title}</span>
                    <span className={`priority-pill ${todo.priority}`} id={`priority-badge-${todo._id}`}>
                      {todo.priority}
                    </span>
                  </div>
                  {todo.description && (
                    <p className="todo-desc">{todo.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mass Delete Button */}
        {todos.length > 0 && (
          <div className="actions-panel" id="mass-delete-panel">
            <button
              id="btn-clear-all"
              type="button"
              className="btn btn-danger"
              onClick={clearAllTodos}
            >
              <Trash2 size={16} />
              Clear All Tasks
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
