import { z } from 'zod';

const isValidDate = (val: string | null | undefined) => {
  if (val === null || val === undefined || val === '') return true;
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoRegex.test(val)) return false;
  const d = new Date(val);
  return !isNaN(d.getTime());
};

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  assigneeId: z.string().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(isValidDate, { message: 'Invalid due date format' }),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title must be at least 2 characters').optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(isValidDate, { message: 'Invalid due date format' }),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
