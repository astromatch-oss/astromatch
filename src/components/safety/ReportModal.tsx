'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/user';
import { ReportReason } from '@/types/safety';
import { ShieldAlert, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (userId: string, reason: ReportReason, details?: string) => Promise<void>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<ReportReason>('inappropriate_content');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(profile.userId, reason, details);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-200 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-400">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Report {profile.firstName}</h3>
            <p className="text-xs text-text-secondary">Help us keep the celestial community safe</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-semibold text-white">Report Submitted</h4>
            <p className="text-xs text-text-secondary">
              Thank you. Our moderation team will inspect this profile promptly. The user has been blocked from your view.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Select Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full bg-surface-100 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-purple"
              >
                <option value="inappropriate_content">Inappropriate / Explicit Photos or Text</option>
                <option value="harassment_or_hate">Harassment, Hate Speech or Bullying</option>
                <option value="fake_profile_or_scam">Fake Profile, Impersonation or Scam</option>
                <option value="underage">Underage User</option>
                <option value="spam">Spam, Promotional or Commercial Links</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred..."
                rows={3}
                className="w-full bg-surface-100 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cosmic-purple"
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Submitting a report will automatically block this user from your Discover feed and chat.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-text-secondary text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
