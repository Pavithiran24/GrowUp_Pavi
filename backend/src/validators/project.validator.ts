import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').optional(),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address format'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
