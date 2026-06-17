/**
 * generate_excel.js
 * 
 * This is a utility script to programmatically create the legacy Excel spreadsheet file
 * named 'initial_todos.xlsx' in the backend directory. This spreadsheet serves as our
 * "legacy database" to demonstrate Excel parsing and MongoDB seeding.
 */

const xlsx = require('xlsx');
const path = require('path');

// Define sample tasks matching the expected schema and database columns.
// Expected Excel columns: title, description, status, priority
const sampleTodos = [
  {
    title: 'Migrate Legacy Databases',
    description: 'Consolidate old spreadsheets into a unified MongoDB instance.',
    status: 'Pending',
    priority: 'High'
  },
  {
    title: 'Design Landing Page Mockup',
    description: 'Create a gorgeous glassmorphic dashboard mockup in Figma.',
    status: 'Completed',
    priority: 'Medium'
  },
  {
    title: 'Review Server Performance',
    description: 'Analyze network latency and index MongoDB fields for faster queries.',
    status: 'Pending',
    priority: 'Low'
  },
  {
    title: 'Write REST API Docs',
    description: 'Outline server endpoints, request JSON schemas, and response formats.',
    status: 'Pending',
    priority: 'Medium'
  },
  {
    title: 'Conduct User Acceptance Testing',
    description: 'Run automated end-to-end tests and gather client feedback.',
    status: 'Completed',
    priority: 'High'
  }
];

try {
  console.log('Generating legacy Excel database file...');

  // Create a new empty workbook object
  const workbook = xlsx.utils.book_new();

  // Convert the array of JSON objects into an Excel worksheet (grid rows & columns)
  const worksheet = xlsx.utils.json_to_sheet(sampleTodos);

  // Append the newly created sheet named 'Initial Todos' into the workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Initial Todos');

  // Define the output file path in the current directory
  const outputPath = path.join(__dirname, 'initial_todos.xlsx');

  // Write workbook to file format .xlsx
  xlsx.writeFile(workbook, outputPath);

  console.log(`Success! Sample spreadsheet created at: ${outputPath}`);
} catch (error) {
  console.error('Error generating Excel file:', error.message);
  process.exit(1);
}
