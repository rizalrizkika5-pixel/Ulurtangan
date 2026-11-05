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
import { ContentItem, ContentStatus } from '../types';
import { logAuditEvent } from './auditService';

const COLLECTION_PATH = 'contentCalendar';

export function subscribeContentItems(
  onUpdate: (items: ContentItem[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('productionDate', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ContentItem[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<ContentItem, 'id'>),
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

export async function createContentItem(
  data: Omit<ContentItem, 'id' | 'contentId' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const contentId = `CNT-${new Date().getFullYear()}-${randNum}`;

    const newItem: Omit<ContentItem, 'id'> = {
      ...data,
      contentId,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newItem);
    await logAuditEvent(
      'KONTEN_BARU',
      `Item konten dibuat: "${data.title}" (${data.contentType})`,
      'Content',
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateContentStatus(
  contentId: string,
  status: ContentStatus,
  publishUrl?: string
): Promise<void> {
  const path = `${COLLECTION_PATH}/${contentId}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, contentId), {
      status,
      publishUrl: publishUrl || '',
    });
    await logAuditEvent(
      'UPDATE_STATUS_KONTEN',
      `Konten ${contentId} status diubah ke ${status}`,
      'Content',
      contentId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
