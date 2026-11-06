import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { logAuditEvent } from './auditService';

/**
 * Inisialisasi otomatis data contoh dimatikan agar sistem mulai murni dari nol (0).
 * Super Admin dan staf menginput seluruh data operasional sendiri secara mandiri.
 */
export async function checkAndSeedInitialData(): Promise<boolean> {
  return false;
}

/**
 * Reset dan kosongkan seluruh data inputan operasional di Firestore
 * (tasks, campaigns, assessments, donations, donors, budgets, expenditures,
 * implementations, contentCalendar, kpi, meetings, decisions, notifications, auditLogs).
 * Seluruh akun pengguna di koleksi 'users' TETAP UTUH dan TIDAK DIHAPUS.
 */
export async function clearAllOperationalData(): Promise<{ success: boolean; count: number }> {
  const collectionsToClear = [
    'tasks',
    'campaigns',
    'assessments',
    'donations',
    'donors',
    'budgets',
    'expenditures',
    'implementations',
    'contentCalendar',
    'kpi',
    'meetings',
    'decisions',
    'notifications',
    'auditLogs',
  ];

  let totalDeleted = 0;

  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
        totalDeleted++;
      }
    } catch (err) {
      console.warn(`Error saat mengosongkan koleksi ${colName}:`, err);
    }
  }

  try {
    await logAuditEvent(
      'RESET_SISTEM',
      `Seluruh data operasional direset ke 0 oleh Super Admin. Total ${totalDeleted} item dibersihkan. Akun pengguna dipertahankan.`,
      'System',
      'SYSTEM_RESET'
    );
  } catch (err) {
    console.warn('Audit log write after reset failed:', err);
  }

  return { success: true, count: totalDeleted };
}
