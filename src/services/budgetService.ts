import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Budget, Expenditure } from '../types';
import { logAuditEvent } from './auditService';

export function subscribeBudgets(
  onUpdate: (budgets: Budget[]) => void
): Unsubscribe {
  const collectionPath = 'budgets';
  try {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const budgets: Budget[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Budget, 'id'>),
        }));
        onUpdate(budgets);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
  }
}

export function subscribeExpenditures(
  onUpdate: (expenditures: Expenditure[]) => void
): Unsubscribe {
  const collectionPath = 'expenditures';
  try {
    const q = query(collection(db, collectionPath), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const expenditures: Expenditure[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Expenditure, 'id'>),
        }));
        onUpdate(expenditures);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
  }
}

export async function createBudget(
  budgetData: Omit<Budget, 'id' | 'budgetId' | 'realizedAmount' | 'createdAt'>
): Promise<string> {
  const collectionPath = 'budgets';
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const budgetId = `BDG-${randNum}`;

    const newBudget: Omit<Budget, 'id'> = {
      ...budgetData,
      budgetId,
      realizedAmount: 0,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, collectionPath), newBudget);
    await logAuditEvent(
      'TAMBAH_POS_ANGGARAN',
      `Pos anggaran dibuat: "${budgetData.category}" Rp ${budgetData.approvedAmount.toLocaleString('id-ID')}`,
      'Budget',
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function createExpenditure(
  expData: Omit<Expenditure, 'id' | 'expenditureId' | 'status' | 'createdAt'>
): Promise<string> {
  const collectionPath = 'expenditures';
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const expenditureId = `EXP-${randNum}`;

    const newExp: Omit<Expenditure, 'id'> = {
      ...expData,
      expenditureId,
      status: 'MENUNGGU_PERSETUJUAN',
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, collectionPath), newExp);
    await logAuditEvent(
      'PENGAJUAN_PENGELUARAN',
      `Pengeluaran diajukan: "${expData.description}" Rp ${expData.amount.toLocaleString('id-ID')}`,
      'Expenditure',
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function approveExpenditure(expenditureId: string, approved: boolean): Promise<void> {
  const path = `expenditures/${expenditureId}`;
  try {
    const currentUser = auth.currentUser;
    const approverName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Pimpinan';
    const approverId = currentUser?.uid || 'UNKNOWN';

    const expDoc = await getDoc(doc(db, 'expenditures', expenditureId));
    if (!expDoc.exists()) throw new Error('Pengeluaran tidak ditemukan');
    const data = expDoc.data() as Expenditure;

    await updateDoc(doc(db, 'expenditures', expenditureId), {
      status: approved ? 'DISETUJUI' : 'DITOLAK',
      approverId,
      approverName,
    });

    if (approved && data.budgetId) {
      try {
        await updateDoc(doc(db, 'budgets', data.budgetId), {
          realizedAmount: increment(data.amount),
        });
      } catch (e) {
        console.warn('Could not increment budget realized amount:', e);
      }
    }

    await logAuditEvent(
      approved ? 'SETUJUI_PENGELUARAN' : 'TOLAK_PENGELUARAN',
      `Pengeluaran ${data.expenditureId} (${approved ? 'Disetujui' : 'Ditolak'}) oleh ${approverName}`,
      'Expenditure',
      expenditureId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
