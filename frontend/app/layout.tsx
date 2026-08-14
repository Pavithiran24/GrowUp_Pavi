import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'TaskFlow | Project & Task Management System',
  description: 'Production-grade enterprise project and task management system built with Next.js, Express, TypeScript, and PostgreSQL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
