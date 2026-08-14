'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { User, UserRole, AuditLog } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import {
  ShieldAlert,
  Users,
  Trash2,
  UserPlus,
  Activity,
  Loader2,
  Search,
} from 'lucide-react';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { CreateUserModal } from '@/components/modals/CreateUserModal';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, logsRes] = await Promise.all([
        apiFetch<User[]>('/users'),
        apiFetch<AuditLog[]>('/admin/audit-logs'),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (logsRes.success && logsRes.data) {
        setAuditLogs(logsRes.data);
      }
    } catch (err) {
      showToast('Error loading admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await apiFetch(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });

      if (res.success) {
        showToast('User role updated successfully', 'success');
        fetchData();
      } else {
        showToast(res.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      showToast('Error updating role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await apiFetch(`/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        showToast('User deleted successfully', 'success');
        fetchData();
      } else {
        showToast(res.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Error deleting user', 'error');
    } finally {
      setDeletingUser(null);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="glass-card p-12 text-center max-w-md mx-auto space-y-4 my-12">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-gray-400">
          The Admin Portal is strictly restricted to system administrators.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-400" />
            Admin User Management & Audit Portal
          </h1>
          <p className="text-sm text-gray-400">Manage account permissions, system roles, and create users/admins</p>
        </div>

        <button
          onClick={() => setIsCreateUserOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
        >
          <UserPlus className="w-4 h-4" />
          Create User Account
        </button>
      </div>

      {/* User Search & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email address..."
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
          />
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Total Registered Users: {users.length}
        </span>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Registered Accounts
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-surface-100/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Role Permission</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-100/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{u.name}</span>
                    </td>
                    <td className="p-4 text-gray-300">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        disabled={u.id === currentUser.id}
                        className="px-3 py-1 glass-input text-xs font-semibold rounded-lg"
                      >
                        <option value="USER" className="bg-surface-200">USER</option>
                        <option value="ADMIN" className="bg-surface-200">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global System Audit Logs */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-bold text-lg text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          Global Audit Trail (Last 100 System Events)
        </h2>
        {auditLogs.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs p-3 rounded-lg bg-surface-100/50 border border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-purple-300">{log.user?.name || 'Anonymous/System'}</span>
                  <span className="text-blue-400 font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {log.action}
                  </span>
                  <span className="text-gray-400">
                    {log.entityType} {log.entityId ? `[${log.entityId}]` : ''}
                  </span>
                </div>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No audit records found.</p>
        )}
      </div>

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onSuccess={fetchData}
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user account "${deletingUser?.name}" (${deletingUser?.email})?`}
        confirmText="Delete Account"
        onConfirm={handleDeleteUser}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
}
