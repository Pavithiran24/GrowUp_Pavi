'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  email: z.string().email('Invalid email address format'),
  role: z.enum(['MEMBER', 'ADMIN']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<Props> = ({ isOpen, projectId, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'MEMBER' },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (res.success) {
        showToast('Member added successfully!', 'success');
        reset();
        onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to add member', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-200 border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Add Project Member</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              User Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="e.g. jane@taskflow.com"
              className="w-full px-4 py-2.5 glass-input text-sm"
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Project Access Level
            </label>
            <select {...register('role')} className="w-full px-4 py-2.5 glass-input text-sm">
              <option value="MEMBER" className="bg-surface-200">Member (View & Edit Tasks)</option>
              <option value="ADMIN" className="bg-surface-200">Project Admin (Manage Members & Settings)</option>
            </select>
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
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
