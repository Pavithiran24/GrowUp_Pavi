'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  Plus,
  ArrowUpRight,
  Activity,
  Loader2,
} from 'lucide-react';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await apiFetch<DashboardStats>('/dashboard/stats');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-gray-400">Track project velocity, task progress, and system metrics</p>
        </div>
        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{metrics.totalProjects}</p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{metrics.completedTasks}</p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-400">{metrics.inProgressTasks}</p>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue Tasks</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400">{metrics.overdueTasks}</p>
        </div>
      </div>

      {/* Main Grid: Recent Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-400" />
              Recent Projects
            </h2>
            <Link href="/projects" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentProjects && stats.recentProjects.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {stats.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between py-3.5 hover:bg-surface-100/50 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm text-white">{p.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{p.description || 'No description provided'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {p._count?.tasks || 0} tasks
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <p className="text-sm">No projects created yet</p>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="text-xs font-semibold text-blue-400 hover:underline"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-purple-400" />
              Recent Tasks
            </h2>
          </div>

          {stats?.recentTasks && stats.recentTasks.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {stats.recentTasks.map((t) => (
                <div key={t.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-white">{t.title}</p>
                    <span className="text-xs text-gray-400">{t.project?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        t.status === 'DONE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-sm text-gray-400">No recent tasks</p>
          )}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          Recent Activity Feed
        </h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs p-3 rounded-lg bg-surface-100/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-400">{log.user?.name || 'System'}</span>
                  <span className="text-gray-300 font-mono px-2 py-0.5 rounded bg-surface-200">{log.action}</span>
                  <span className="text-gray-400">{log.entityType} ({log.entityId || 'N/A'})</span>
                </div>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No activity recorded</p>
        )}
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
}
