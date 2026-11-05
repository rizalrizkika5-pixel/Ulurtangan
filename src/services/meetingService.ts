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
import { Meeting, Decision } from '../types';
import { logAuditEvent } from './auditService';
import { createTask } from './taskService';

export function subscribeMeetings(
  onUpdate: (meetings: Meeting[]) => void
): Unsubscribe {
  const collectionPath = 'meetings';
  try {
    const q = query(collection(db, collectionPath), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const meetings: Meeting[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Meeting, 'id'>),
        }));
        onUpdate(meetings);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
  }
}

export function subscribeDecisions(
  onUpdate: (decisions: Decision[]) => void
): Unsubscribe {
  const collectionPath = 'decisions';
  try {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const decisions: Decision[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Decision, 'id'>),
        }));
        onUpdate(decisions);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
  }
}

export async function createMeeting(
  data: Omit<Meeting, 'id' | 'meetingId' | 'createdAt'>,
  decisions?: Array<{ topic: string; decisionText: string; picName?: string; picId?: string; deadline?: string }>
): Promise<string> {
  const collectionPath = 'meetings';
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const meetingId = `MTG-${new Date().getFullYear()}-${randNum}`;

    const newMeeting: Omit<Meeting, 'id'> = {
      ...data,
      meetingId,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, collectionPath), newMeeting);

    // If decisions were provided, save them too
    if (decisions && decisions.length > 0) {
      for (const decItem of decisions) {
        const decRand = Math.floor(100 + Math.random() * 900);
        await addDoc(collection(db, 'decisions'), {
          decisionId: `DEC-${decRand}`,
          meetingId: docRef.id,
          meetingTitle: data.title,
          topic: decItem.topic,
          decisionText: decItem.decisionText,
          picId: decItem.picId || '',
          picName: decItem.picName || '',
          deadline: decItem.deadline || data.date,
          status: 'BELUM_DILAKSANAKAN',
          createdAt: now,
        });
      }
    }

    await logAuditEvent(
      'NOTULENSI_RAPAT',
      `Notulensi rapat dicatat: "${data.title}" dipimpin oleh ${data.leaderName}`,
      'Meeting',
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

// Convert meeting decision into an actionable task
export async function convertDecisionToTask(
  decision: Decision,
  department: string,
  picId: string,
  picName: string
): Promise<string> {
  const taskId = await createTask({
    title: `[Tindak Lanjut Rapat] ${decision.topic}`,
    description: `Arahan Keputusan Rapat: ${decision.decisionText}`,
    department,
    picId,
    picName,
    createdById: 'SYSTEM_DECISION',
    createdByName: 'Notulensi Rapat YIUT',
    priority: 'TINGGI',
    status: 'SIAP_DIKERJAKAN',
    deadline: decision.deadline || new Date().toISOString().split('T')[0],
    progress: 0,
  });

  await updateDoc(doc(db, 'decisions', decision.id), {
    status: 'PROSES',
    convertedTaskId: taskId,
    picId,
    picName,
  });

  await logAuditEvent(
    'KONVERSI_KEPUTUSAN_RAPAT',
    `Keputusan "${decision.topic}" dikonversi menjadi Tugas ID: ${taskId}`,
    'Decision',
    decision.id
  );

  return taskId;
}
