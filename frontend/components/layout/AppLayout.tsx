'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-gray-400">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
};
