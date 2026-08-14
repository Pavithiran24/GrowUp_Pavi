import { ProjectRepository } from '../repositories/project.repository';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/error.middleware';
import { CreateProjectInput, UpdateProjectInput, AddMemberInput } from '../validators/project.validator';
import { UserPayload } from '../types';
import { AuditService } from './audit.service';

export class ProjectService {
  static async getProjects(user: UserPayload) {
    const isAdmin = user.role === 'ADMIN';
    return ProjectRepository.findAccessibleProjects(user.id, isAdmin);
  }

  static async getProjectById(projectId: string, user: UserPayload) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You are not a member of this project', 403);
    }

    return project;
  }

  static async createProject(user: UserPayload, input: CreateProjectInput) {
    const project = await ProjectRepository.create({
      name: input.name,
      description: input.description,
      ownerId: user.id,
    });

    await AuditService.log(user.id, 'PROJECT_CREATED', 'Project', project.id);

    return project;
  }

  static async updateProject(projectId: string, user: UserPayload, input: UpdateProjectInput) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const member = project.members.find((m) => m.userId === user.id);
    const canEdit = isAdmin || project.ownerId === user.id || (member && (member.role === 'OWNER' || member.role === 'ADMIN'));

    if (!canEdit) {
      throw new AppError('Access denied: You do not have permission to modify this project', 403);
    }

    const updated = await ProjectRepository.update(projectId, input);
    await AuditService.log(user.id, 'PROJECT_UPDATED', 'Project', projectId);

    return updated;
  }

  static async deleteProject(projectId: string, user: UserPayload) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = project.ownerId === user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError('Access denied: Only project owners or admins can delete this project', 403);
    }

    await ProjectRepository.delete(projectId);
    await AuditService.log(user.id, 'PROJECT_DELETED', 'Project', projectId);
  }

  static async addMember(projectId: string, user: UserPayload, input: AddMemberInput) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const member = project.members.find((m) => m.userId === user.id);
    const canAdd = isAdmin || project.ownerId === user.id || (member && (member.role === 'OWNER' || member.role === 'ADMIN'));

    if (!canAdd) {
      throw new AppError('Access denied: You do not have permission to manage members in this project', 403);
    }

    const targetUser = await UserRepository.findByEmail(input.email.toLowerCase());
    if (!targetUser) {
      throw new AppError('User with specified email address does not exist', 404);
    }

    const existingMember = await ProjectRepository.getMember(projectId, targetUser.id);
    if (existingMember) {
      throw new AppError('User is already a member of this project', 409);
    }

    const newMember = await ProjectRepository.addMember(projectId, targetUser.id, input.role);
    await AuditService.log(user.id, 'PROJECT_MEMBER_ADDED', 'ProjectMember', newMember.id, {
      projectId,
      userId: targetUser.id,
    });

    return newMember;
  }

  static async removeMember(projectId: string, targetUserId: string, user: UserPayload) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.ownerId === targetUserId) {
      throw new AppError('Cannot remove the owner of the project', 400);
    }

    const isAdmin = user.role === 'ADMIN';
    const isSelf = user.id === targetUserId;
    const currentMember = project.members.find((m) => m.userId === user.id);
    const canRemove = isAdmin || isSelf || project.ownerId === user.id || (currentMember && (currentMember.role === 'OWNER' || currentMember.role === 'ADMIN'));

    if (!canRemove) {
      throw new AppError('Access denied: You do not have permission to remove this member', 403);
    }

    const existingMember = await ProjectRepository.getMember(projectId, targetUserId);
    if (!existingMember) {
      throw new AppError('Member not found in this project', 404);
    }

    await ProjectRepository.removeMember(projectId, targetUserId);
    await AuditService.log(user.id, 'PROJECT_MEMBER_REMOVED', 'ProjectMember', existingMember.id, {
      projectId,
      targetUserId,
    });
  }

  static async getMembers(projectId: string, user: UserPayload) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isAdmin = user.role === 'ADMIN';
    const isMember = project.members.some((m) => m.userId === user.id);

    if (!isAdmin && !isMember) {
      throw new AppError('Access denied: You are not a member of this project', 403);
    }

    return project.members;
  }
}
