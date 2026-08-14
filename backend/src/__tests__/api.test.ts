import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/db';

describe('TaskFlow Entire Project Automated End-to-End Test Suite', () => {
  let adminToken: string;
  let userToken: string;
  let secondaryUserToken: string;

  let adminUserId: string;
  let normalUserId: string;
  let secondaryUserId: string;
  let createdTargetUserId: string;

  let testProjectId: string;
  let testTaskId: string;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. AUTHENTICATION & REGISTRATION SUITE                                     */
  /* -------------------------------------------------------------------------- */
  describe('1. Authentication & Registration Flow', () => {
    it('POST /api/auth/register — Register new user account successfully', async () => {
      const email = `testuser_${Date.now()}@taskflow.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Automation Test User',
          email,
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('accessToken');

      secondaryUserId = res.body.data.user.id;
      secondaryUserToken = res.body.data.accessToken;
    });

    it('POST /api/auth/register — Reject duplicate email registration (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Admin',
          email: 'admin@taskflow.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/register — Reject password mismatch (422 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Mismatch User',
          email: 'mismatch@taskflow.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login — Login with Admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@taskflow.com',
          password: 'AdminPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');

      adminUserId = res.body.data.user.id;
      adminToken = res.body.data.accessToken;
    });

    it('POST /api/auth/login — Login with Normal User credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@taskflow.com',
          password: 'UserPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      normalUserId = res.body.data.user.id;
      userToken = res.body.data.accessToken;
    });

    it('POST /api/auth/login — Reject invalid password (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@taskflow.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me — Return current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@taskflow.com');
    });

    it('POST /api/auth/logout — Logout user successfully', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Logged out');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. USER PROFILE & SETTINGS SUITE                                           */
  /* -------------------------------------------------------------------------- */
  describe('2. Profile Management', () => {
    it('GET /api/users/profile — Fetch profile data', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(normalUserId);
    });

    it('PATCH /api/users/profile — Update user profile name', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'John Doe Updated',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('John Doe Updated');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. ADMIN USER ADMINISTRATION SUITE                                         */
  /* -------------------------------------------------------------------------- */
  describe('3. Admin User Management', () => {
    it('GET /api/users — List all system users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/users — Admin create new user account with specified role', async () => {
      const email = `qacreated_${Date.now()}@taskflow.com`;
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'QA Admin Created User',
          email,
          password: 'Password123!',
          role: 'USER',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(email);
      createdTargetUserId = res.body.data.id;
    });

    it('PATCH /api/users/:id — Admin elevate user role to ADMIN', async () => {
      const res = await request(app)
        .patch(`/api/users/${createdTargetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'ADMIN',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('DELETE /api/users/:id — Admin delete user account', async () => {
      const res = await request(app)
        .delete(`/api/users/${createdTargetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });

    it('DELETE /api/users/:selfId — Reject Admin self-deletion (400 Bad Request)', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('cannot delete their own account');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. PROJECT MANAGEMENT & MEMBERSHIP SUITE                                    */
  /* -------------------------------------------------------------------------- */
  describe('4. Project Workspaces & Team Members', () => {
    it('POST /api/projects — Create project workspace', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Automated E2E Suite Project',
          description: 'Project created during full automated test execution.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      testProjectId = res.body.data.id;
    });

    it('GET /api/projects — List accessible projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/projects/:id — Fetch project details', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Automated E2E Suite Project');
    });

    it('PATCH /api/projects/:id — Update project details', async () => {
      const res = await request(app)
        .patch(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'Updated project description by automated test.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toContain('Updated project description');
    });

    it('POST /api/projects/:id/members — Add member to project by email', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'jane@taskflow.com',
          role: 'MEMBER',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/projects/:id/members — Reject duplicate project member (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'jane@taskflow.com',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already a member');
    });

    it('GET /api/projects/:id — Verify project non-member access blocked (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${secondaryUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('not a member');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. TASK MANAGEMENT, FILTERING & ASSIGNMENT SUITE                          */
  /* -------------------------------------------------------------------------- */
  describe('5. Tasks & Workflow Filtering', () => {
    it('POST /api/projects/:projectId/tasks — Create task inside project workspace', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Automated E2E Test Task',
          description: 'Execute end-to-end suite checks.',
          status: 'TODO',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      testTaskId = res.body.data.id;
    });

    it('POST /api/projects/:projectId/tasks — Reject assigning task to non-member (400 Bad Request)', async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Assignee Task',
          assigneeId: secondaryUserId, // secondaryUser is NOT a member of testProjectId
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('must be an existing member');
    });

    it('GET /api/tasks/:id — Get task details', async () => {
      const res = await request(app)
        .get(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Automated E2E Test Task');
    });

    it('PATCH /api/tasks/:id — Edit task priority to MEDIUM', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          priority: 'MEDIUM',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe('MEDIUM');
    });

    it('PATCH /api/tasks/:id/status — Update status to IN_PROGRESS', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('GET /api/projects/:projectId/tasks — Multi-parameter status & priority filtering', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/tasks?status=IN_PROGRESS&priority=MEDIUM`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('IN_PROGRESS');
    });

    it('GET /api/projects/:projectId/tasks — Search tasks by text query', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/tasks?search=Automated`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('DELETE /api/tasks/:id — Delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. DASHBOARD METRICS & AUDIT LOGS SUITE                                   */
  /* -------------------------------------------------------------------------- */
  describe('6. Dashboard Analytics & Audit Logs', () => {
    it('GET /api/dashboard/stats — Return dashboard metrics & feeds', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('metrics');
      expect(res.body.data.metrics).toHaveProperty('totalProjects');
      expect(res.body.data.metrics).toHaveProperty('totalTasks');
      expect(Array.isArray(res.body.data.recentProjects)).toBe(true);
    });

    it('GET /api/admin/audit-logs — Admin fetch global audit feed', async () => {
      const res = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('DELETE /api/projects/:id — Clean up test project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. ADVANCED EDGE CASE & BOUNDARY CONDITION SUITE                          */
  /* -------------------------------------------------------------------------- */
  describe('7. Advanced Boundary Conditions & Security Robustness', () => {
    let edgeProjectId: string;

    it('POST /api/projects — Reject whitespace-only project name (422 Validation Error)', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '     ',
          description: 'Whitespace title project test',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/projects — Setup temporary project for edge testing', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Edge Case Test Workspace',
        });

      expect(res.status).toBe(201);
      edgeProjectId = res.body.data.id;
    });

    it('POST /api/projects/:projectId/tasks — Reject whitespace-only task title (422 Validation Error)', async () => {
      const res = await request(app)
        .post(`/api/projects/${edgeProjectId}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '   ',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/projects/:projectId/tasks — Reject invalid due date format (422 Validation Error)', async () => {
      const res = await request(app)
        .post(`/api/projects/${edgeProjectId}/tasks`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Invalid Date Task',
          dueDate: 'invalid-date-string-999',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors[0].message).toContain('Invalid due date format');
    });

    it('PATCH /api/tasks/:id/status — Reject invalid status enum string (422 Validation Error)', async () => {
      const res = await request(app)
        .patch('/api/tasks/fake-id/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'INVALID_ENUM_STATUS',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/projects/:projectId/tasks — Resilient to SQL Injection in search query', async () => {
      const res = await request(app)
        .get(`/api/projects/${edgeProjectId}/tasks?search=' OR 1=1 --`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('DELETE /api/projects/:id — Clean up edge project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${edgeProjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });
  });
});
