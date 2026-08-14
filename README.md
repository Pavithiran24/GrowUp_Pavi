# 🚀 TaskFlow — Project & Task Management System

TaskFlow is a modern full-stack application built with **Next.js 14**, **TypeScript**, **Express**, **Prisma**, and **JWT Authentication**.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript, Prisma ORM, SQLite / PostgreSQL
- **Authentication**: JWT Access Tokens & HTTP-only Refresh Cookies, Role-Based Access Control (Admin / User)
- **Testing**: Jest, Supertest

---

## 🔑 Demo Login Accounts
- **Admin Login**: `admin@taskflow.com` / `AdminPass123!`
- **User Login**: `john@taskflow.com` / `UserPass123!`

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 3. Run Development Servers
```bash
# Backend (http://localhost:5000)
cd backend
npm run dev

# Frontend (http://localhost:3000)
cd frontend
npm run dev
```

### 4. Run Automated Tests
```bash
cd backend
npm test
```
