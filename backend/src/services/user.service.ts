import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/error.middleware';
import { UpdateProfileInput, UpdateUserRoleInput, CreateUserInput } from '../validators/user.validator';
import { hashPassword } from '../utils/hash';
import { AuditService } from './audit.service';

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.email) {
      const existingUser = await UserRepository.findByEmail(input.email.toLowerCase());
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email address is already in use by another user', 409);
      }
    }

    const updatedUser = await UserRepository.update(userId, {
      ...(input.name && { name: input.name }),
      ...(input.email && { email: input.email.toLowerCase() }),
    });

    await AuditService.log(userId, 'USER_PROFILE_UPDATED', 'User', userId);

    return updatedUser;
  }

  static async getAllUsers() {
    return UserRepository.findAll();
  }

  static async getUserById(id: string) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async createUser(adminUserId: string, input: CreateUserInput) {
    const existingUser = await UserRepository.findByEmail(input.email.toLowerCase());
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
    });

    await AuditService.log(adminUserId, 'ADMIN_CREATED_USER', 'User', user.id, { role: input.role });

    return user;
  }

  static async updateUserRole(adminUserId: string, targetUserId: string, input: UpdateUserRoleInput) {
    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw new AppError('Target user not found', 404);
    }

    const updatedUser = await UserRepository.update(targetUserId, { role: input.role });

    await AuditService.log(adminUserId, 'USER_ROLE_UPDATED', 'User', targetUserId, { newRole: input.role });

    return updatedUser;
  }

  static async deleteUser(adminUserId: string, targetUserId: string) {
    if (adminUserId === targetUserId) {
      throw new AppError('Administrators cannot delete their own account', 400);
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw new AppError('Target user not found', 404);
    }

    await UserRepository.delete(targetUserId);
    await AuditService.log(adminUserId, 'USER_DELETED', 'User', targetUserId);
  }
}
