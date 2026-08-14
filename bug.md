# TaskFlow — God Mode QA Edge Case Audit & Bug Report (`bug.md`)

This document details the **God Mode Edge Case QA Audit**, unexpected boundary conditions uncovered during stress testing, resolved bugs log, and full 40-point automated test suite results.

---

## 🐞 Discovered & Resolved Edge Case Bugs Log

### Bug #6: JavaScript `Date.parse()` Soft-Accepting Invalid Year Strings (`dueDate: "invalid-date-string-999"`)
- **Module**: Task Validation & Service Layer (`task.validator.ts` & `task.service.ts`)
- **Symptom**: Sending an invalid date string like `"invalid-date-string-999"` returned `201 Created` instead of `422 Validation Error`.
- **Root Cause**: Node.js V8 Date engine interprets strings containing `"999"` as Year 999 AD (`Sun Oct 01 0999`), causing standard `Date.parse()` to return a numeric timestamp instead of `NaN`.
- **Fix**: Implemented strict ISO date format regex validation (`/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/`) in [`task.validator.ts`](file:///c:/Users/theva/Desktop/Task01/backend/src/validators/task.validator.ts#L3-L9).

### Bug #7: PostgreSQL `mode: 'insensitive'` Parameter Error in SQLite Search Queries
- **Module**: Repository Query Layer (`task.repository.ts`)
- **Symptom**: `PrismaClientValidationError: Unknown argument mode. Did you mean lte?` when querying tasks with search strings.
- **Root Cause**: `mode: 'insensitive'` is PostgreSQL-specific syntax in Prisma. SQLite string contains queries are case-insensitive by default in Prisma.
- **Fix**: Removed `mode: 'insensitive'` from Prisma `contains` query filter in [`task.repository.ts`](file:///c:/Users/theva/Desktop/Task01/backend/src/repositories/task.repository.ts#L32-L36).

### Bug #8: Whitespace-Only Project Name & Task Title Bypass
- **Module**: Input Validation Schemas (`project.validator.ts` & `task.validator.ts`)
- **Symptom**: Sending string containing only spaces (`"     "`) bypassed `min(2)` validation.
- **Root Cause**: Zod schema lacked `.trim()` modifier prior to length checks.
- **Fix**: Added `.trim()` before `.min(2)` in [`project.validator.ts`](file:///c:/Users/theva/Desktop/Task01/backend/src/validators/project.validator.ts#L4) and [`task.validator.ts`](file:///c:/Users/theva/Desktop/Task01/backend/src/validators/task.validator.ts#L11).

---

## 🧪 Automated Edge Case Test Suite Results (40 / 40 Passed)

```text
PASS src/__tests__/api.test.ts (18.767 s)
  TaskFlow Entire Project Automated End-to-End Test Suite
    1. Authentication & Registration Flow
      ✓ POST /api/auth/register — Register new user account successfully (716 ms)
      ✓ POST /api/auth/register — Reject duplicate email registration (409 Conflict) (246 ms)
      ✓ POST /api/auth/register — Reject password mismatch (422 Validation Error) (42 ms)
      ✓ POST /api/auth/login — Login with Admin credentials (308 ms)
      ✓ POST /api/auth/login — Login with Normal User credentials (283 ms)
      ✓ POST /api/auth/login — Reject invalid password (401 Unauthorized) (421 ms)
      ✓ GET /api/auth/me — Return current user profile (106 ms)
      ✓ POST /api/auth/logout — Logout user successfully (87 ms)
    2. Profile Management
      ✓ GET /api/users/profile — Fetch profile data (93 ms)
      ✓ PATCH /api/users/profile — Update user profile name (124 ms)
    3. Admin User Management
      ✓ GET /api/users — List all system users (117 ms)
      ✓ POST /api/users — Admin create new user account with specified role (657 ms)
      ✓ PATCH /api/users/:id — Admin elevate user role to ADMIN (147 ms)
      ✓ DELETE /api/users/:id — Admin delete user account (108 ms)
      ✓ DELETE /api/users/:selfId — Reject Admin self-deletion (400 Bad Request) (63 ms)
    4. Project Workspaces & Team Members
      ✓ POST /api/projects — Create project workspace (74 ms)
      ✓ GET /api/projects — List accessible projects (72 ms)
      ✓ GET /api/projects/:id — Fetch project details (35 ms)
      ✓ PATCH /api/projects/:id — Update project details (65 ms)
      ✓ POST /api/projects/:id/members — Add member to project by email (96 ms)
      ✓ POST /api/projects/:id/members — Reject duplicate project member (409 Conflict) (85 ms)
      ✓ GET /api/projects/:id — Verify project non-member access blocked (403 Forbidden) (69 ms)
    5. Tasks & Workflow Filtering
      ✓ POST /api/projects/:projectId/tasks — Create task inside project workspace (86 ms)
      ✓ POST /api/projects/:projectId/tasks — Reject assigning task to non-member (400 Bad Request) (91 ms)
      ✓ GET /api/tasks/:id — Get task details (55 ms)
      ✓ PATCH /api/tasks/:id — Edit task priority to MEDIUM (143 ms)
      ✓ PATCH /api/tasks/:id/status — Update status to IN_PROGRESS (129 ms)
      ✓ GET /api/projects/:projectId/tasks — Multi-parameter status & priority filtering (103 ms)
      ✓ GET /api/projects/:projectId/tasks — Search tasks by text query (96 ms)
      ✓ DELETE /api/tasks/:id — Delete task (135 ms)
    6. Dashboard Analytics & Audit Logs
      ✓ GET /api/dashboard/stats — Return dashboard metrics & feeds (134 ms)
      ✓ GET /api/admin/audit-logs — Admin fetch global audit feed (154 ms)
      ✓ DELETE /api/projects/:id — Clean up test project (68 ms)
    7. Advanced Boundary Conditions & Security Robustness
      ✓ POST /api/projects — Reject whitespace-only project name (422 Validation Error) (46 ms)
      ✓ POST /api/projects — Setup temporary project for edge testing (49 ms)
      ✓ POST /api/projects/:projectId/tasks — Reject whitespace-only task title (422 Validation Error) (37 ms)
      ✓ POST /api/projects/:projectId/tasks — Reject invalid due date format (422 Validation Error) (46 ms)
      ✓ PATCH /api/tasks/:id/status — Reject invalid status enum string (422 Validation Error) (41 ms)
      ✓ GET /api/projects/:projectId/tasks — Resilient to SQL Injection in search query (43 ms)
      ✓ DELETE /api/projects/:id — Clean up edge project (54 ms)

Test Suites: 1 passed, 1 total
Tests:       40 passed, 40 total (100% PASS RATE)
```
