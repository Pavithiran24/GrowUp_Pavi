import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { UserPayload, UserRole } from '../types';
import { AuditService } from './audit.service';

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await UserRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 409);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await UserRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    });

    await AuditService.log(user.id, 'USER_REGISTERED', 'User', user.id);

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, accessToken, refreshToken };
  }

  static async login(input: LoginInput) {
    const user = await UserRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw new AppError('Invalid email address or password', 401);
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email address or password', 401);
    }

    await AuditService.log(user.id, 'USER_LOGIN', 'User', user.id);

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  static async refresh(token: string) {
    if (!token) {
      throw new AppError('Refresh token is required', 401);
    }

    try {
      const payload = verifyRefreshToken(token);
      const user = await UserRepository.findById(payload.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const newPayload: UserPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      };

      const accessToken = generateAccessToken(newPayload);
      const refreshToken = generateRefreshToken(newPayload);

      return { accessToken, refreshToken };
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  static async getMe(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
