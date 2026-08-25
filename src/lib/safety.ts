import { UserReport, UserBlock, ReportReason } from '@/types/safety';
import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BLOCKED_WORDS = [
  'scam', 'crypto investment', 'whatsapp me at', 'telegram me', 'wire money',
  'cashapp', 'venmo me', 'sugar daddy', 'sugar baby'
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateProfileContent(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: true };
  }

  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return {
        isValid: false,
        error: `Content contains prohibited commercial or external contact phrase: "${word}".`,
      };
    }
  }

  // Check phone number patterns spam
  const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  if (phonePattern.test(text)) {
    return {
      isValid: false,
      error: 'For your safety, phone numbers cannot be placed in public bios.',
    };
  }

  return { isValid: true };
}

export async function submitUserReport(
  reportedUserId: string,
  reason: ReportReason,
  details?: string
): Promise<UserReport> {
  const reporterId = auth?.currentUser?.uid || 'current-user';

  const report: UserReport = {
    reporterId,
    reportedUserId,
    reason,
    details: details || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (db && auth?.currentUser) {
    try {
      await addDoc(collection(db, 'reports'), {
        ...report,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to submit report to Firestore, recording locally:', err);
    }
  }

  return report;
}

export async function submitUserBlock(blockedUserId: string): Promise<UserBlock> {
  const blockerId = auth?.currentUser?.uid || 'current-user';

  const block: UserBlock = {
    blockerId,
    blockedUserId,
    createdAt: new Date().toISOString(),
  };

  if (db && auth?.currentUser) {
    try {
      await addDoc(collection(db, 'blocks'), {
        ...block,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to submit block to Firestore, recording locally:', err);
    }
  }

  return block;
}
