'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  CheckCircle,
  Database,
  Lock,
  ArrowLeft,
  Eye,
  Trash2,
} from 'lucide-react';

interface MockReport {
  id: string;
  reporterName: string;
  reportedUser: string;
  reason: string;
  details: string;
  timeAgo: string;
  status: 'pending' | 'resolved';
}

export default function AdminPage() {
  const { user, isAdmin, loginAsDemoUser } = useAuth();

  const [reports, setReports] = useState<MockReport[]>([
    {
      id: 'rep-1',
      reporterName: 'Aria',
      reportedUser: 'Suspicious Profile #409',
      reason: 'Spam / Commercial Links',
      details: 'User included external payment handles and crypto referral links in bio.',
      timeAgo: '15 mins ago',
      status: 'pending',
    },
    {
      id: 'rep-2',
      reporterName: 'Julian',
      reportedUser: 'Impersonator_Account',
      reason: 'Fake Profile / Stolen Pictures',
      details: 'Identical profile photo detected from an unverified public model profile.',
      timeAgo: '2 hours ago',
      status: 'pending',
    }
  ]);

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface-200/90 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white">Admin Access Restricted</h2>
            <p className="text-xs text-text-secondary">
              This route requires verified administrator privileges or an active demo administrator session.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={loginAsDemoUser}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cosmic-purple to-cosmic-pink text-white font-semibold text-xs shadow-cosmic"
            >
              Sign In with Demo Admin Privileges
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-surface-100 text-text-secondary text-xs font-medium block"
            >
              Return to AstroMatch Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleResolveReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r))
    );
  };

  const handleDismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin & Moderation Gateway</h1>
            <p className="text-xs text-text-secondary">System integrity, user reports queue, and safety controls</p>
          </div>
        </div>

        <Link
          href="/discover"
          className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to App</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-surface-200/80 border border-white/10 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold">Total Stargazers</span>
          <p className="text-2xl font-bold text-white">1,248</p>
          <span className="text-[11px] text-emerald-400 font-medium">+14% this week</span>
        </div>

        <div className="p-5 rounded-3xl bg-surface-200/80 border border-white/10 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold">Pending Reports</span>
          <p className="text-2xl font-bold text-rose-400">{reports.filter((r) => r.status === 'pending').length}</p>
          <span className="text-[11px] text-rose-300 font-medium">Requires moderation</span>
        </div>

        <div className="p-5 rounded-3xl bg-surface-200/80 border border-white/10 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold">Firestore Security</span>
          <p className="text-2xl font-bold text-emerald-400">Strict</p>
          <span className="text-[11px] text-text-muted">Rules version 2 active</span>
        </div>

        <div className="p-5 rounded-3xl bg-surface-200/80 border border-white/10 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold">Astrology Engine</span>
          <p className="text-2xl font-bold text-purple-300">Ready</p>
          <span className="text-[11px] text-text-muted">Extensible service active</span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-surface-200/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Reported User Queue</span>
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-100 text-text-secondary border border-white/5 font-semibold">
            {reports.length} Reports
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center text-text-muted space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">All Clear</p>
            <p className="text-xs">No pending moderation flags at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl bg-surface-100/90 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                      {report.reason}
                    </span>
                    <span className="text-xs text-text-muted">• {report.timeAgo}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Reported: <span className="text-rose-200">{report.reportedUser}</span> (by {report.reporterName})
                  </h4>
                  <p className="text-xs text-text-secondary">{report.details}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {report.status === 'resolved' ? (
                    <span className="text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Action Taken</span>
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
                      >
                        Ban / Suspend
                      </button>
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        className="py-1.5 px-3 rounded-xl bg-surface-200 hover:bg-surface-50 text-text-secondary hover:text-white font-medium text-xs transition-colors"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
