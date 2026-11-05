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
import { Implementation } from '../types';
import { logAuditEvent } from './auditService';

const COLLECTION_PATH = 'implementations';

export function subscribeImplementations(
  onUpdate: (items: Implementation[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Implementation[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Implementation, 'id'>),
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

export async function createImplementation(
  data: Omit<Implementation, 'id' | 'implementationId' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const implementationId = `IMP-${new Date().getFullYear()}-${randNum}`;

    const newImp: Omit<Implementation, 'id'> = {
      ...data,
      implementationId,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newImp);
    await logAuditEvent(
      'IMPLEMENTASI_KEGIATAN',
      `Implementasi program dicatat: "${data.activityTitle}" di ${data.location}`,
      'Implementation',
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateImplementation(
  id: string,
  updates: Partial<Implementation>
): Promise<void> {
  const path = `${COLLECTION_PATH}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
