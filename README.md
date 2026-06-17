# 📋 TaskGlass — MERN Stack To-Do List Application

A complete, beginner-friendly **MERN stack** (MongoDB, Express, React, Node.js) To-Do List application featuring legacy **Excel database migration**, a premium **Glassmorphic UI**, and a fully documented codebase explaining how data flows from frontend to backend.

![TaskGlass Banner](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge) ![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Excel Data Migration** | Reads a legacy `.xlsx` spreadsheet and seeds MongoDB automatically |
| 🎨 **Glassmorphic UI** | Translucent cards, backdrop blur, animated gradient blobs, and vibrant priority badges |
| ✅ **Task Management** | Create, toggle completion, and bulk-delete tasks through a REST API |
| 📊 **Live Metrics** | Real-time counters for Pending, Completed, and Total tasks |
| 💬 **Extensively Commented** | Every file explains the data flow from user interaction → React state → Fetch API → Express → MongoDB |
| 📱 **Responsive Design** | Adapts beautifully from desktop to mobile viewports |

---

## 🏗️ Project Structure

```
ToDo-List/
├── backend/                    # Node.js + Express + Mongoose API
│   ├── server.js               # Express REST API server (4 endpoints)
│   ├── seed.js                 # Excel → MongoDB migration script
│   ├── generate_excel.js       # Helper to create the sample .xlsx file
│   ├── initial_todos.xlsx      # Legacy Excel spreadsheet database
│   ├── package.json
│   └── .gitignore
│
├── frontend/                   # React + Vite SPA
│   ├── index.html              # Entry HTML with Google Fonts & SEO meta
│   ├── vite.config.js          # Vite config (port 3000)
│   ├── src/
│   │   ├── App.jsx             # Main React component (state, fetch, UI)
│   │   ├── index.css           # Glassmorphism theme stylesheet
│   │   ├── App.css
│   │   └── main.jsx            # React DOM entry point
│   ├── package.json
│   └── .gitignore
│
└── .gitignore                  # Root-level gitignore
```

---

## 🔄 Data Flow Architecture

```
┌─────────────┐     HTTP Requests      ┌──────────────┐     Mongoose      ┌───────────┐
│   React UI  │ ◄──────────────────►   │  Express API │ ◄──────────────► │  MongoDB  │
│  (Port 3000)│   Fetch API / JSON     │  (Port 5000) │   ODM Queries    │ (todo_db) │
└─────────────┘                        └──────────────┘                  └───────────┘
                                              ▲
                                              │  seed.js
                                              │  (one-time migration)
                                       ┌──────────────┐
                                       │  Excel File  │
                                       │  (.xlsx)     │
                                       └──────────────┘
```

### API Endpoints

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/todos` | Fetch all tasks from MongoDB |
| `POST` | `/api/todos` | Create a new task |
| `PUT` | `/api/todos/:id` | Toggle task completion status |
| `DELETE` | `/api/todos` | Delete all tasks (bulk clear) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **MongoDB Community Server** (running locally on port `27017`) — [Download](https://www.mongodb.com/try/download/community)
- **Git** — [Download](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/apoorba-sawaiyan/MERN-ToDo-List-App.git
cd MERN-ToDo-List-App
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

**3. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Database Setup

**4. Generate the legacy Excel spreadsheet** (if not already present)

```bash
cd ../backend
npm run generate-excel
```

This creates `initial_todos.xlsx` with 5 sample tasks.

**5. Seed MongoDB from the Excel file**

```bash
npm run seed
```

This reads the spreadsheet, maps columns to schema fields, and inserts records into the `todo_db` database (only if the collection is empty).

### Running the Application

**6. Start the backend server** (Terminal 1)

```bash
cd backend
npm run dev
```

The Express API will start on **http://localhost:5000**

**7. Start the frontend dev server** (Terminal 2)

```bash
cd frontend
npm run dev
```

The React app will open on **http://localhost:3000**

---

## 🎨 UI Design

The frontend uses a **Glassmorphism** design language featuring:

- 🌈 **Animated gradient background** with floating color blobs (blue, pink, purple)
- 🪟 **Frosted glass panels** using `backdrop-filter: blur(20px)` and translucent borders
- 🏷️ **Color-coded priority badges** — Green (Low), Amber (Medium), Red (High)
- ✅ **Completion states** — Checked tasks get `line-through` text decoration and reduced opacity
- ⚡ **Smooth micro-animations** — Hover lifts, glow effects, and pulsing empty states
- 🔤 **Premium typography** — Plus Jakarta Sans from Google Fonts

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | UI rendering & dev server |
| **Styling** | Vanilla CSS | Glassmorphism theme |
| **Icons** | Lucide React | Modern SVG icon set |
| **Backend** | Express.js | REST API framework |
| **Database** | MongoDB + Mongoose | Document storage & ODM |
| **Migration** | xlsx (SheetJS) | Excel spreadsheet parsing |
| **Dev Tools** | Nodemon | Auto-restart on backend changes |

---

## 📂 Excel Spreadsheet Format

The seeding script expects an `.xlsx` file with these columns:

| title | description | status | priority |
|-------|-------------|--------|----------|
| Migrate Legacy Databases | Consolidate old spreadsheets... | Pending | High |
| Design Landing Page Mockup | Create a gorgeous glassmorphic... | Completed | Medium |

- **status**: `"Pending"` → `isCompleted: false`, `"Completed"` → `isCompleted: true`
- **priority**: Must be one of `"Low"`, `"Medium"`, or `"High"`

---

## 📜 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm start` | Start server with node (production) |
| `npm run seed` | Migrate Excel data into MongoDB |
| `npm run generate-excel` | Generate the sample `initial_todos.xlsx` |

### Frontend (`/frontend`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build production bundle to `/dist` |
| `npm run preview` | Preview the production build locally |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
