'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  User as UserIcon,
  Settings,
  ShieldAlert,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface-200/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Brand / Toggle */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center md:hidden">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight md:hidden">TaskFlow</span>

        <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          {user?.role === 'ADMIN' ? 'System Administrator' : 'Project Member'}
        </span>
      </div>

      {/* User Quick Info */}
      <div className="hidden sm:flex items-center gap-4">
        <div className="text-right">
          <span className="block text-xs font-medium text-white">{user?.name}</span>
          <span className="block text-[11px] text-gray-400">{user?.email}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface-200/95 backdrop-blur-xl border-b border-gray-800 p-4 space-y-2 md:hidden animate-fade-in shadow-2xl z-50">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-surface-100"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            Dashboard
          </Link>
          <Link
            href="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-surface-100"
          >
            <FolderKanban className="w-4 h-4 text-blue-400" />
            Projects
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-surface-100"
          >
            <UserIcon className="w-4 h-4 text-blue-400" />
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-surface-100"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            Settings
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-blue-400 hover:bg-surface-100"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Portal
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};
