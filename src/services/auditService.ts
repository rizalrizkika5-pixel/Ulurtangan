import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { AuditLog } from '../types';

export async function logAuditEvent(
  action: string,
  details: string,
  resourceType: string,
  resourceId?: string,
  customUserName?: string
): Promise<void> {
  const user = auth.currentUser;
  const userId = user?.uid || 'SYSTEM';
  const userName = customUserName || user?.displayName || user?.email?.split('@')[0] || 'Sistem YIUT';

  const logData = {
    logId: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    userId,
    userName,
    action,
    details,
    resourceType,
    resourceId: resourceId || '',
    timestamp: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, 'auditLogs'), logData);
  } catch (error) {
    // Audit logging should not crash the primary flow, but record error in console
    console.error('Audit log failed:', error);
  }
}
