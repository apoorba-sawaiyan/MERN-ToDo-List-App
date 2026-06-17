/**
 * seed.js
 * 
 * Database seeding script. It connects to the local MongoDB database 'todo_db',
 * reads the legacy Excel spreadsheet file 'initial_todos.xlsx', maps column titles
 * (title, description, status, priority) to database schema fields, and uses Mongoose
 * bulk insertion (insertMany) to populate the collection—only if it is currently empty.
 */

const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');

// Connection string to local MongoDB database
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_db';

// Define Schema for To-Do tasks in this migration file.
// (Matches the schema declared in server.js to maintain structure)
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required']
  },
  description: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, { timestamps: true }); // Automatically record createdAt and updatedAt timestamps

const Todo = mongoose.model('Todo', todoSchema);

async function seedDatabase() {
  try {
    console.log('==================================================');
    console.log('DATABASE SEEDING PROCESS STARTED');
    console.log('==================================================');

    // 1. Establish database connection
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Database connection successful.');

    // 2. Prevent duplication: Seed only if collection is empty
    const currentCount = await Todo.countDocuments();
    console.log(`Current record count in database: ${currentCount}`);

    if (currentCount > 0) {
      console.log('Database already contains records. Seeding skipped to preserve existing data.');
      mongoose.connection.close();
      process.exit(0);
    }

    // 3. Locate the spreadsheet file
    const excelPath = path.join(__dirname, 'initial_todos.xlsx');
    console.log(`Loading spreadsheet database from: ${excelPath}`);

    // 4. Load & parse the Excel Workbook
    const workbook = xlsx.readFile(excelPath);
    
    // Retrieve the first sheet's name
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert cells to JSON row arrays
    const excelRows = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Successfully parsed ${excelRows.length} rows from Excel sheet.`);

    if (excelRows.length === 0) {
      console.warn('Warning: Spreadsheet was empty. No data to seed.');
      mongoose.connection.close();
      process.exit(0);
    }

    // 5. Map the Excel columns to Schema fields
    // Columns: title, description, status, priority
    // Database schema fields: title, description, isCompleted, priority
    const mappedTodos = excelRows.map((row, index) => {
      // Map Excel status value to boolean 'isCompleted'
      // Handles values like "Completed" / "Done" / true
      const isCompletedValue = row.status === 'Completed' || row.status === 'Done' || !!row.isCompleted;

      // Handle priorities and restrict to valid enum inputs
      let priorityValue = 'Medium';
      if (row.priority && ['Low', 'Medium', 'High'].includes(row.priority)) {
        priorityValue = row.priority;
      }

      return {
        title: row.title || `Task #${index + 1}`,
        description: row.description || '',
        isCompleted: isCompletedValue,
        priority: priorityValue
      };
    });

    // 6. Execute bulk insert into MongoDB
    console.log('Migrating rows and performing bulk insertion into database...');
    const result = await Todo.insertMany(mappedTodos);
    console.log(`Success! Inserted ${result.length} tasks into 'todos' collection.`);

    // 7. Cleanup and disconnect
    await mongoose.connection.close();
    console.log('Database connection closed.');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL: Seeding migration process failed:');
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
