import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@taskflow.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@taskflow.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@taskflow.com',
      passwordHash: userPasswordHash,
      role: 'USER',
    },
  });

  console.log('✅ Created users: Admin (admin@taskflow.com), John (john@taskflow.com), Jane (jane@taskflow.com)');

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Next.js Dashboard Redesign',
      description: 'Overhaul the enterprise SaaS user dashboard with high performance components and dark mode support.',
      ownerId: john.id,
      members: {
        create: [
          { userId: john.id, role: 'OWNER' },
          { userId: jane.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'API Infrastructure Security Audit',
      description: 'Implement JWT refresh tokens, role authorization middleware, rate limiting, and security headers.',
      ownerId: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'OWNER' },
          { userId: john.id, role: 'ADMIN' },
        ],
      },
    },
  });

  console.log('✅ Created projects: Next.js Dashboard Redesign, API Infrastructure Security Audit');

  // 3. Create Tasks
  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        title: 'Design UI Wireframes for Dashboard',
        description: 'Create high fidelity wireframes using modern design tokens and cohesive color themes.',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: jane.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        title: 'Setup React Hook Form & Zod Schema Validation',
        description: 'Integrate client-side validation logic for register, login, and project forms.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assigneeId: john.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        title: 'Implement Task Filtering & Search Bar',
        description: 'Allow users to filter tasks by status, priority, assignee, and text query.',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: john.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project2.id,
        title: 'Configure Helmet Security Headers & CORS',
        description: 'Enforce strict origin controls and prevent XSS/clickjacking attacks.',
        status: 'DONE',
        priority: 'HIGH',
        assigneeId: admin.id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        projectId: project2.id,
        title: 'Penetration Testing on Auth Endpoints',
        description: 'Verify authorization checks on project & task mutation endpoints.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: john.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created sample tasks');

  // 4. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'SYSTEM_INITIALIZED', entityType: 'System' },
      { userId: john.id, action: 'PROJECT_CREATED', entityType: 'Project', entityId: project1.id },
      { userId: admin.id, action: 'PROJECT_CREATED', entityType: 'Project', entityId: project2.id },
    ],
  });

  console.log('✅ Created seed audit logs');
  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
