import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { KPI } from '../types';
import { logAuditEvent } from './auditService';

const COLLECTION_PATH = 'kpi';

export function subscribeKPIs(
  onUpdate: (items: KPI[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('periodMonth', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: KPI[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<KPI, 'id'>),
        }));
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
  }
}

export async function createKPI(
  data: Omit<KPI, 'id' | 'kpiId' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const kpiId = `KPI-${data.periodMonth}-${randNum}`;

    const newKPI: Omit<KPI, 'id'> = {
      ...data,
      kpiId,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newKPI);
    await logAuditEvent(
      'INPUT_KPI_KARYAWAN',
      `Penilaian KPI dicatat untuk ${data.userName} (${data.periodMonth}): ${data.grade} (${data.score})`,
      'KPI',
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateKPI(id: string, updates: Partial<KPI>): Promise<void> {
  const path = `${COLLECTION_PATH}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
