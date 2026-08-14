'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Project, Task, TaskStatus, TaskPriority } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  FolderKanban,
  Users,
  Plus,
  Search,
  Filter,
  UserPlus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { AddMemberModal } from '@/components/modals/AddMemberModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Filter States
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await apiFetch<Project>(`/projects/${projectId}`);
      if (res.success && res.data) {
        setProject(res.data);
      } else {
        showToast(res.message || 'Failed to load project details', 'error');
      }
    } catch (err) {
      showToast('Error loading project details', 'error');
    }
  }, [projectId, showToast]);

  const fetchTasks = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (statusFilter !== 'ALL') query.append('status', statusFilter);
      if (priorityFilter !== 'ALL') query.append('priority', priorityFilter);
      if (assigneeFilter !== 'ALL') query.append('assigneeId', assigneeFilter);
      if (searchQuery) query.append('search', searchQuery);

      const res = await apiFetch<Task[]>(`/projects/${projectId}/tasks?${query.toString()}`);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      showToast('Error fetching tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter, priorityFilter, assigneeFilter, searchQuery, showToast]);

  useEffect(() => {
    fetchProjectDetails();
    fetchTasks();
  }, [fetchProjectDetails, fetchTasks]);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        showToast('Task status updated', 'success');
        fetchTasks();
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('An error occurred', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      const res = await apiFetch(`/tasks/${deletingTask.id}`, { method: 'DELETE' });
      if (res.success) {
        showToast('Task deleted successfully', 'success');
        fetchTasks();
      } else {
        showToast(res.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showToast('Error deleting task', 'error');
    } finally {
      setDeletingTask(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMemberId) return;
    try {
      const res = await apiFetch(`/projects/${projectId}/members/${removingMemberId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Member removed from project', 'success');
        fetchProjectDetails();
        fetchTasks();
      } else {
        showToast(res.message || 'Failed to remove member', 'error');
      }
    } catch (err) {
      showToast('Error removing member', 'error');
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isProjectOwnerOrAdmin =
    project.ownerId === user?.id ||
    user?.role === 'ADMIN' ||
    project.members.some((m) => m.userId === user?.id && (m.role === 'OWNER' || m.role === 'ADMIN'));

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Project Header Info */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Active Project
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-3xl">
              {project.description || 'No detailed description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isProjectOwnerOrAdmin && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-200 bg-surface-100 hover:bg-surface-50 border border-gray-700 transition-all"
              >
                <UserPlus className="w-4 h-4 text-blue-400" />
                Add Member
              </button>
            )}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Project Metadata Footer */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-800/80 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            Owner: <strong className="text-white">{project.owner?.name}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            Members: <strong className="text-white">{project.members.length}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Project Members Strip */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold text-sm text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Project Team Members ({project.members.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {project.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 border border-gray-800 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-[10px]">
                {m.user.name[0].toUpperCase()}
              </div>
              <span className="font-medium text-white">{m.user.name}</span>
              <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-500/10">
                {m.role}
              </span>
              {isProjectOwnerOrAdmin && m.userId !== project.ownerId && (
                <button
                  onClick={() => setRemovingMemberId(m.userId)}
                  className="text-gray-500 hover:text-rose-400 ml-1"
                  title="Remove member"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Toolbar Filters & Search */}
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task title or description..."
              className="w-full pl-10 pr-4 py-2 glass-input text-sm"
            />
          </div>

          {/* Filters Select Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 glass-input text-xs"
              >
                <option value="ALL" className="bg-surface-200">All Statuses</option>
                <option value="TODO" className="bg-surface-200">To Do</option>
                <option value="IN_PROGRESS" className="bg-surface-200">In Progress</option>
                <option value="DONE" className="bg-surface-200">Done</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 glass-input text-xs"
            >
              <option value="ALL" className="bg-surface-200">All Priorities</option>
              <option value="HIGH" className="bg-surface-200">High Priority</option>
              <option value="MEDIUM" className="bg-surface-200">Medium Priority</option>
              <option value="LOW" className="bg-surface-200">Low Priority</option>
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 glass-input text-xs"
            >
              <option value="ALL" className="bg-surface-200">All Assignees</option>
              {project.members.map((m) => (
                <option key={m.user.id} value={m.user.id} className="bg-surface-200">
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-400" />
          Project Tasks ({tasks.length})
        </h2>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="glass-card p-5 space-y-4 flex flex-col justify-between hover:border-gray-700 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-white line-clamp-2">{task.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-blue-400 p-1"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTask(task)}
                        className="text-gray-400 hover:text-rose-400 p-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 min-h-[2rem]">
                    {task.description || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Due date if exists */}
                    {task.dueDate && (
                      <span className="text-[10px] font-medium text-gray-400 bg-surface-100 px-2 py-0.5 rounded-full border border-gray-800">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                      {task.assignee?.name ? task.assignee.name[0].toUpperCase() : '?'}
                    </div>
                    <span className="truncate max-w-[100px]">{task.assignee?.name || 'Unassigned'}</span>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className="px-2.5 py-1 glass-input text-[11px] font-semibold rounded-lg"
                  >
                    <option value="TODO" className="bg-surface-200">To Do</option>
                    <option value="IN_PROGRESS" className="bg-surface-200">In Progress</option>
                    <option value="DONE" className="bg-surface-200">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center space-y-4 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Tasks Found</h3>
            <p className="text-sm text-gray-400">
              There are no tasks matching your filters in this project workspace.
            </p>
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Create First Task
            </button>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        projectId={projectId}
        members={project.members}
        initialTask={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchTasks}
      />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        projectId={projectId}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={fetchProjectDetails}
      />

      <ConfirmModal
        isOpen={!!deletingTask}
        title="Delete Task"
        message={`Are you sure you want to delete task "${deletingTask?.title}"?`}
        confirmText="Delete Task"
        onConfirm={handleDeleteTask}
        onClose={() => setDeletingTask(null)}
      />

      <ConfirmModal
        isOpen={!!removingMemberId}
        title="Remove Member"
        message="Are you sure you want to remove this user from the project?"
        confirmText="Remove Member"
        onConfirm={handleRemoveMember}
        onClose={() => setRemovingMemberId(null)}
      />
    </div>
  );
}
