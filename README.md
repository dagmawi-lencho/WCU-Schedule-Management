# Online Class Scheduling System

A comprehensive university class scheduling system built with modern web technologies. The system automatically generates conflict-free schedules for academic batches, semesters, and sections while managing instructor workloads and room allocations.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Scheduling Rules](#scheduling-rules)
- [License](#license)

## Features

- **Multi-Role Authentication**: Support for Admin, Instructor, and Department Head roles with JWT-based authentication
- **Academic Structure Management**: Manage batches, semesters, departments, and courses
- **Instructor Management**: Register instructors, assign courses, and track teaching workloads
- **Intelligent Scheduling**: Automatic schedule generation with conflict detection and resolution
- **Room Management**: Allocate regular classrooms and laboratory rooms based on course requirements
- **Export Functionality**: Export schedules to PDF, PNG, and JPG formats
- **Real-time Dashboard**: Overview of system statistics and quick actions
- **Admin Panel**: Web-based administration interface for system management

## Technology Stack

### Backend
- Node.js with TypeScript
- Express.js framework
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

### Admin Panel
- Modern HTML/CSS with vanilla JavaScript
- Stored in `backend/public` and served directly by Express
- Uses Fetch API to communicate with the backend REST endpoints
- Styled with custom red/white Wachamo University branding

## Project Structure

```
online-class-schedule/
├── api/
│   └── index.ts             # Serverless API entry point for Vercel
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   └── server.ts        # Application entry point
│   ├── public/              # Wachamo-branded admin panel (static files)
│   └── package.json
└── package.json             # Root package with scripts
```

## Prerequisites

- Node.js version 18 or higher
- MongoDB version 5.0 or higher (local installation or MongoDB Atlas)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/online-class-schedule.git
cd online-class-schedule
```

2. Install all dependencies:
```bash
npm run install:all
```

This command installs dependencies for the root project and backend.

## Configuration

1. Create the backend environment file:
```bash
cp backend/.env.example backend/.env
```

2. Configure the following environment variables in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/class-schedule
JWT_SECRET=your-secure-secret-key
NODE_ENV=development
```

For MongoDB Atlas, use a connection string in the format:
```
mongodb+srv://username:password@cluster.mongodb.net/class-schedule
```

## Running the Application

### Development Mode

Start the backend server (which also serves the Wachamo-branded admin panel):
```bash
npm run dev
```

Or run it directly from the backend folder:
```bash
cd backend
npm run dev
```

### Access Points

- Admin Panel + API: http://localhost:5000

> **API base override**: When deploying the static admin panel separately from the backend, set `window.__API_BASE__` before the embedded script in `backend/public/index.html` to point to the desired API URL. Otherwise, it automatically uses `/api` for production builds and `http://localhost:5000/api` for local development.

### Default Admin Credentials

On first startup, the system creates a default administrator account:
- Email: admin@wachemo.edu
- Password: Admin@2024

Change these credentials after the first login.

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Authenticate user |

### Resource Endpoints

| Resource | Base Path | Operations |
|----------|-----------|------------|
| Users | /api/users | CRUD operations |
| Batches | /api/batches | CRUD operations |
| Semesters | /api/semesters | CRUD operations |
| Courses | /api/courses | CRUD operations |
| Instructors | /api/instructors | CRUD + workload |
| Schedules | /api/schedules | Generate, CRUD, publish |
| Rooms | /api/rooms | CRUD + initialize |
| Departments | /api/departments | CRUD operations |

### Health Check

```bash
GET /api/health
```

Returns server status and database connection state.

## User Roles

### Administrator
- Full system access
- Manage users, batches, semesters, and courses
- Register and manage instructors
- Generate and publish schedules
- Access admin panel

### Instructor
- View personal timetable
- View assigned courses
- View teaching workload

### Department Head
- Manage department-specific data
- View department schedules

## Scheduling Rules

The scheduling algorithm enforces the following constraints:

1. **No Instructor Overlap**: An instructor cannot be scheduled for multiple classes at the same time
2. **No Room Overlap**: A room cannot host multiple classes simultaneously
3. **No Section Overlap**: A section cannot have multiple classes at the same time
4. **Credit Load Limits**: Instructors cannot exceed their maximum credit load
5. **Room Type Matching**: Laboratory courses are assigned to lab rooms only
6. **Time Slot Preferences**: Major courses are scheduled in morning slots, common courses in afternoon slots

## Production Build

The Wachamo-branded admin panel is served directly from `backend/public`, so no separate frontend build step is required.

Build the backend:
```bash
cd backend
npm run build
```

Start production server:
```bash
cd backend
npm start
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

