import { TaskRepository } from '../repositories/task.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { AppError } from '../middleware/error.middleware';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from '../validators/task.validator';
import { UserPayload, TaskFilterParams } from '../types';
import { AuditService } from './audit.service';

export class TaskService {
  static async getProjectTasks(projectId: string, user: UserPayload, filters: TaskFilterParams) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You are not authorized to view tasks in this project', 403);
    }

    return TaskRepository.findProjectTasks(projectId, filters);
  }

  static async getTaskById(taskId: string, user: UserPayload) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const project = await ProjectRepository.findById(task.projectId);
    const isMember = project?.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You are not authorized to view this task', 403);
    }

    return task;
  }

  static async createTask(projectId: string, user: UserPayload, input: CreateTaskInput) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You must be a project member to create tasks', 403);
    }

    if (input.assigneeId) {
      const isAssigneeMember = project.members.some((m) => m.userId === input.assigneeId);
      if (!isAssigneeMember) {
        throw new AppError('Task assignee must be an existing member of this project', 400);
      }
    }

    if (input.dueDate) {
      const parsedDate = new Date(input.dueDate);
      if (isNaN(parsedDate.getTime())) {
        throw new AppError('Invalid due date format', 400);
      }
    }

    const task = await TaskRepository.create({
      projectId,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    });

    await AuditService.log(user.id, 'TASK_CREATED', 'Task', task.id, { projectId });

    return task;
  }

  static async updateTask(taskId: string, user: UserPayload, input: UpdateTaskInput) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await ProjectRepository.findById(task.projectId);
    if (!project) {
      throw new AppError('Associated project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You do not have permission to edit this task', 403);
    }

    if (input.assigneeId) {
      const isAssigneeMember = project.members.some((m) => m.userId === input.assigneeId);
      if (!isAssigneeMember) {
        throw new AppError('Task assignee must be an existing member of this project', 400);
      }
    }

    const updatedTask = await TaskRepository.update(taskId, {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate === null ? null : undefined,
    });

    await AuditService.log(user.id, 'TASK_UPDATED', 'Task', taskId);

    return updatedTask;
  }

  static async updateTaskStatus(taskId: string, user: UserPayload, input: UpdateTaskStatusInput) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await ProjectRepository.findById(task.projectId);
    if (!project) {
      throw new AppError('Associated project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You do not have permission to update task status', 403);
    }

    const updatedTask = await TaskRepository.updateStatus(taskId, input.status);
    await AuditService.log(user.id, 'TASK_STATUS_UPDATED', 'Task', taskId, { status: input.status });

    return updatedTask;
  }

  static async deleteTask(taskId: string, user: UserPayload) {
    const task = await TaskRepository.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = await ProjectRepository.findById(task.projectId);
    if (!project) {
      throw new AppError('Associated project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = project.ownerId === user.id;
    const isAssignee = task.assigneeId === user.id;
    const member = project.members.find((m) => m.userId === user.id);
    const canDelete = isAdmin || isOwner || isAssignee || (member && (member.role === 'OWNER' || member.role === 'ADMIN'));

    if (!canDelete) {
      throw new AppError('Access denied: You do not have permission to delete this task', 403);
    }

    await TaskRepository.delete(taskId);
    await AuditService.log(user.id, 'TASK_DELETED', 'Task', taskId);
  }
}
