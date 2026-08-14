'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Project } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  Edit,
  Users,
  CheckSquare,
  Loader2,
  Calendar,
} from 'lucide-react';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await apiFetch<Project[]>('/projects');
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    try {
      const res = await apiFetch(`/projects/${deletingProject.id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast('Project deleted successfully', 'success');
        fetchProjects();
      } else {
        showToast(res.message || 'Failed to delete project', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setDeletingProject(null);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects Workspace</h1>
          <p className="text-sm text-gray-400">Manage all accessible project hubs and workspaces</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name or description..."
          className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isOwner = project.ownerId === user?.id || user?.role === 'ADMIN';
            return (
              <div
                key={project.id}
                className="glass-card p-6 flex flex-col justify-between hover:border-gray-700 transition-all group shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-bold text-lg text-white hover:text-blue-400 transition-colors line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    {isOwner && (
                      <button
                        onClick={() => setDeletingProject(project)}
                        className="text-gray-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
                    {project.description || 'No detailed description specified.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-800">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {project._count?.members || project.members?.length || 1} members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                      {project._count?.tasks || project.tasks?.length || 0} tasks
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-xs font-semibold text-blue-400 hover:underline"
                  >
                    Open Workspace &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Projects Found</h3>
          <p className="text-sm text-gray-400">
            {search ? 'No projects matched your search terms.' : 'You have not joined or created any projects yet.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all"
          >
            Create Project
          </button>
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />

      <ConfirmModal
        isOpen={!!deletingProject}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deletingProject?.name}"? All associated tasks and membership records will be lost.`}
        confirmText="Delete Project"
        onConfirm={handleDeleteProject}
        onClose={() => setDeletingProject(null)}
      />
    </div>
  );
}
