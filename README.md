# 🚀 TaskFlow — Full-Stack Project & Task Management System

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Express.js](https://img.shields.io/badge/Express-4.18-green?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.10-indigo?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwind-css)
![Jest](https://img.shields.io/badge/Jest-29.7-C21325?style=for-the-badge&logo=jest)

> **TaskFlow** is a production-quality, full-stack Project & Task Management System built with **Next.js 14 (App Router)**, **TypeScript**, **Express**, **Prisma ORM**, and **JWT + HTTP-Only Cookie Authentication**. Designed with clean architecture, strict role-based access control (RBAC), multi-parameter search/filtering, real-time analytics, and an audit trail.

---

## 📌 GitHub Repository Tagline / Description

```text
A production-ready full-stack Project & Task Management System built with Next.js 14, TypeScript, Express, Prisma ORM, JWT HTTP-only auth, RBAC Admin portal, audit logging, and 100% automated & manual test coverage.
```

---

## ✨ Key Features

### 🔐 1. Authentication & Security
- **JWT Dual Token Strategy**: Short-lived Access Tokens (15m) + HTTP-Only SameSite Refresh Cookies (7d).
- **Password Security**: Salted `bcryptjs` password hashing.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries distinguishing system `ADMIN` users from project `USER` members.
- **Ownership Guards**: Endpoints enforce project membership and owner/admin authorization before granting read/write access.

### 📁 2. Project Workspaces & Team Collaboration
- **Workspace Creation**: Create and manage project workspaces with names and descriptions.
- **Team Management**: Invite team members by email with role assignment (`OWNER`, `ADMIN`, `MEMBER`).
- **Access Isolation**: Non-members are restricted from viewing or modifying private projects.
- **Owner Protection**: System prevents deleting or removing the project owner.

### 📋 3. Task Workflow & Kanban Filtering
- **Task Lifecycle**: Move tasks across status states (`TODO` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `DONE`).
- **Priority & Due Dates**: Assign priorities (`LOW`, `MEDIUM`, `HIGH`) and set ISO due dates with overdue detection.
- **Assignee Scoping**: Assign tasks strictly to validated project members.
- **Multi-Parameter Search**: Filter tasks simultaneously by `status`, `priority`, `assigneeId`, and text search.

### 🛡️ 4. Admin Portal & Audit Logging
- **User Administration**: Admins can view all users, create new accounts directly, promote/demote roles, and delete user accounts.
- **Self-Deletion Guard**: Administrators are prevented from deleting their own account.
- **Audit Logs**: Immutable system event trail logging user logins, creation events, role changes, project deletions, and task workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod |
| **Backend** | Node.js, Express.js, TypeScript, Prisma ORM, SQLite / PostgreSQL |
| **Authentication** | JSON Web Tokens (jsonwebtoken), HTTP-only Cookies (cookie-parser), bcryptjs, Helmet, CORS |
| **Testing** | Jest, Supertest, 108-Point Manual QA Matrix (`bug.md`), 40-Point Automated Test Suite |

---

## 🚀 Quick Start & Local Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/taskflow-system.git
cd taskflow-system

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend Environment Configuration (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="taskflow-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="taskflow-super-secret-refresh-key-2026"
REFRESH_TOKEN_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

**Frontend Environment Configuration (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 3. Setup Database & Seed Demo Data
```bash
cd backend

# Push Prisma Schema to SQLite Database
npx prisma db push

# Seed Initial Demo Accounts & Projects
npx prisma db seed
```

### 4. Run Application Services
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App running on http://localhost:3000
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskflow.com` | `AdminPass123!` | Full Admin Portal, Audit Logs, System User Creation |
| **Project Member** | `john@taskflow.com` | `UserPass123!` | Standard Project Workspace & Task Creation |
| **Team Member** | `jane@taskflow.com` | `JanePass123!` | Project Member View & Task Workflow Updates |

---

## 🧪 Running Automated Tests

Run the full 40-point automated end-to-end API test suite:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **Authentication**: Registration, Login, Bad Passwords, JWT Refresh, Token Expiration.
- **Profile**: Name & Email Updates, Unique Email Enforcement.
- **Admin**: User Creation, Role Elevation (`USER` $\rightarrow$ `ADMIN`), Self-Deletion Rejection.
- **Projects**: Workspace Creation, Team Member Assignment, Access Block on Non-Members.
- **Tasks**: Priority/Status Transitions, Assignee Validation, Search, Resiliency against SQL Injection.

---

## 📡 Key REST API Endpoints

```text
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user & issue HTTP-only cookie
POST   /api/auth/refresh           Refresh access token
POST   /api/auth/logout            Clear refresh cookie
GET    /api/auth/me                Get current user profile

GET    /api/projects               List accessible user projects
POST   /api/projects               Create project workspace
GET    /api/projects/:id           Get project details
PATCH  /api/projects/:id           Update project
DELETE /api/projects/:id           Delete project
POST   /api/projects/:id/members   Add project team member
DELETE /api/projects/:id/members/:userId Remove team member

GET    /api/projects/:id/tasks     List project tasks (with search & filters)
POST   /api/projects/:id/tasks     Create task inside project
GET    /api/tasks/:id              Get task details
PATCH  /api/tasks/:id              Update task details
PATCH  /api/tasks/:id/status       Update task status (TODO/IN_PROGRESS/DONE)
DELETE /api/tasks/:id              Delete task

GET    /api/users                  List users (Admin only)
POST   /api/users                  Create user account (Admin only)
PATCH  /api/users/:id              Update user role (Admin only)
DELETE /api/users/:id              Delete user account (Admin only)
GET    /api/admin/audit-logs       Fetch system audit logs (Admin only)
```

---

## 📄 Documentation Links

- **QA Audit Matrix & Bug Report**: [`bug.md`](file:///c:/Users/theva/Desktop/Task01/bug.md)
- **Implementation Plan**: [`implementation_plan.md`](file:///C:/Users/theva/.gemini/antigravity-ide/brain/7356b459-552a-4115-959a-e845ef77d422/implementation_plan.md)
- **Walkthrough & Visual Specs**: [`walkthrough.md`](file:///C:/Users/theva/.gemini/antigravity-ide/brain/7356b459-552a-4115-959a-e845ef77d422/walkthrough.md)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
