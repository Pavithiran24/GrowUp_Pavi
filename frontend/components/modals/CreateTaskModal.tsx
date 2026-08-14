'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckSquare, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Task, User } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  projectId: string;
  members: { user: User }[];
  initialTask?: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTaskModal: React.FC<Props> = ({
  isOpen,
  projectId,
  members,
  initialTask,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'TODO',
      priority: 'MEDIUM',
    },
  });

  useEffect(() => {
    if (initialTask) {
      setValue('title', initialTask.title);
      setValue('description', initialTask.description || '');
      setValue('status', initialTask.status);
      setValue('priority', initialTask.priority);
      setValue('assigneeId', initialTask.assigneeId || '');
      setValue(
        'dueDate',
        initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
      );
    } else {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
      });
    }
  }, [initialTask, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        assigneeId: data.assigneeId || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };

      const endpoint = initialTask ? `/tasks/${initialTask.id}` : `/projects/${projectId}/tasks`;
      const method = initialTask ? 'PATCH' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success) {
        showToast(`Task ${initialTask ? 'updated' : 'created'} successfully!`, 'success');
        reset();
        onSuccess();
        onClose();
      } else {
        showToast(res.message || `Failed to ${initialTask ? 'update' : 'create'} task`, 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative bg-surface-200 border border-gray-800/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] space-y-6 my-auto overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g. Write unit tests for auth middleware"
              className="w-full px-4 py-2.5 glass-input text-sm"
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Task details and acceptance criteria..."
              className="w-full px-4 py-2.5 glass-input text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Status
              </label>
              <select {...register('status')} className="w-full px-4 py-2.5 glass-input text-sm">
                <option value="TODO" className="bg-surface-200">To Do</option>
                <option value="IN_PROGRESS" className="bg-surface-200">In Progress</option>
                <option value="DONE" className="bg-surface-200">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Priority
              </label>
              <select {...register('priority')} className="w-full px-4 py-2.5 glass-input text-sm">
                <option value="LOW" className="bg-surface-200">Low</option>
                <option value="MEDIUM" className="bg-surface-200">Medium</option>
                <option value="HIGH" className="bg-surface-200">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Assignee
              </label>
              <select {...register('assigneeId')} className="w-full px-4 py-2.5 glass-input text-sm">
                <option value="" className="bg-surface-200">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id} className="bg-surface-200">
                    {m.user.name} ({m.user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                {...register('dueDate')}
                type="date"
                className="w-full px-4 py-2.5 glass-input text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-surface-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
