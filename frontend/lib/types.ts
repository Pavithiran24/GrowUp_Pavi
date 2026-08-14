export type UserRole = 'ADMIN' | 'USER';
export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  user: User;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  project?: { id: string; name: string };
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  assignee?: User | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: User;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: string;
  timestamp: string;
}

export interface DashboardStats {
  metrics: DashboardMetrics;
  recentProjects: Project[];
  recentTasks: Task[];
  recentActivity: AuditLog[];
}
