'use client';

import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { Settings, Bell, Lock, Shield, Moon, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);

  const handleSave = () => {
    showToast('Preferences saved successfully', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-400">Configure application preferences, security, and notifications</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <h2 className="font-bold text-base text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          Notification Preferences
        </h2>

        <div className="space-y-4 divide-y divide-gray-800">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-white">Email Digest</p>
              <p className="text-xs text-gray-400">Receive daily task summary and activity notifications</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-surface-100 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm font-semibold text-white">Task Assignment Alerts</p>
              <p className="text-xs text-gray-400">Get instantly notified when assigned to a new project task</p>
            </div>
            <input
              type="checkbox"
              checked={taskUpdates}
              onChange={(e) => setTaskUpdates(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-surface-100 text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        <h2 className="font-bold text-base text-white flex items-center gap-2 pt-4">
          <Shield className="w-5 h-5 text-purple-400" />
          Security & Tokens
        </h2>

        <div className="p-4 rounded-xl bg-surface-100 border border-gray-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-300">HTTP-Only Cookie Refresh Token</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <p className="text-gray-400">
            Session tokens use 15-minute access JWTs backed by 7-day HTTP-only refresh cookies.
          </p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
