import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Task, TaskPriority, TaskStatus } from '../types';
import { logAuditEvent } from './auditService';
import { sendNotification } from './notificationService';

const COLLECTION_PATH = 'tasks';

export function subscribeTasks(
  onUpdate: (tasks: Task[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Task, 'id'>),
        }));
        onUpdate(tasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
  }
}

export async function getAllTasks(): Promise<Task[]> {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const path = `${COLLECTION_PATH}/${taskId}`;
  try {
    const snap = await getDoc(doc(db, COLLECTION_PATH, taskId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Task, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createTask(
  taskData: Omit<Task, 'id' | 'taskId' | 'createdAt' | 'updatedAt' | 'history'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const taskIdNum = Math.floor(100 + Math.random() * 900);
    const taskId = `TSK-${new Date().getFullYear()}-${taskIdNum}`;

    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      taskId,
      progress: taskData.progress || 0,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          timestamp: now,
          userName: taskData.createdByName || 'Admin',
          action: 'Tugas Dibuat',
          note: `Prioritas: ${taskData.priority}, Deadline: ${taskData.deadline}`,
        },
      ],
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newTask);

    // Audit log
    await logAuditEvent(
      'PEMBUATAN_TUGAS',
      `Tugas baru dibuat: "${taskData.title}" ditugaskan ke ${taskData.picName}`,
      'Task',
      docRef.id
    );

    // Trigger notification to PIC
    if (taskData.picId) {
      await sendNotification(
        taskData.picId,
        'TUGAS_BARU',
        `📌 Tugas Baru Diberikan: ${taskData.title}`,
        `Anda ditugaskan sebagai PIC utama dengan deadline ${taskData.deadline} (Prioritas: ${taskData.priority}).`,
        `/tasks?taskId=${docRef.id}`
      );
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
  actionNote?: string
): Promise<void> {
  const path = `${COLLECTION_PATH}/${taskId}`;
  try {
    const now = new Date().toISOString();
    const currentUser = auth.currentUser;
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Staf';

    const currentDoc = await getDoc(doc(db, COLLECTION_PATH, taskId));
    const currentData = currentDoc.data() as Task | undefined;
    const currentHistory = currentData?.history || [];

    const historyItem = {
      timestamp: now,
      userName,
      action: actionNote || 'Pembaruan Data Tugas',
      note: updates.status ? `Status diubah ke ${updates.status}` : undefined,
    };

    await updateDoc(doc(db, COLLECTION_PATH, taskId), {
      ...updates,
      updatedAt: now,
      history: [...currentHistory, historyItem],
    });

    await logAuditEvent(
      'PERUBAHAN_TUGAS',
      `Tugas ${currentData?.taskId || taskId} diperbarui: ${actionNote || 'Perubahan rincian tugas'}`,
      'Task',
      taskId
    );

    // Notify PIC if status or deadline was updated by someone else
    if (currentData && currentData.picId && currentData.picId !== currentUser?.uid) {
      if (updates.deadline && updates.deadline !== currentData.deadline) {
        await sendNotification(
          currentData.picId,
          'PERUBAHAN_TUGAS',
          `📅 Deadline Diperbarui: ${currentData.title}`,
          `Batas waktu pengerjaan diubah menjadi ${updates.deadline}.`,
          `/tasks?taskId=${taskId}`
        );
      }
      if (updates.status && updates.status !== currentData.status) {
        await sendNotification(
          currentData.picId,
          'PERUBAHAN_TUGAS',
          `🔄 Status Tugas Berubah: ${currentData.title}`,
          `Status tugas kini: ${updates.status}.`,
          `/tasks?taskId=${taskId}`
        );
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateTaskProgress(
  taskId: string,
  progress: number,
  notes: string,
  proofLinks?: string[],
  obstacles?: string,
  requestApproval?: boolean
): Promise<void> {
  const path = `${COLLECTION_PATH}/${taskId}`;
  try {
    const now = new Date().toISOString();
    const currentUser = auth.currentUser;
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Karyawan';

    const currentDoc = await getDoc(doc(db, COLLECTION_PATH, taskId));
    const currentData = currentDoc.data() as Task | undefined;
    const currentHistory = currentData?.history || [];

    let newStatus: TaskStatus = currentData?.status || 'BERJALAN';
    if (requestApproval) {
      newStatus = 'MENUNGGU_PERSETUJUAN';
    } else if (progress === 100) {
      newStatus = 'MENUNGGU_PERSETUJUAN';
    } else if (progress > 0 && newStatus === 'BACKLOG') {
      newStatus = 'BERJALAN';
    }

    if (obstacles && obstacles.trim() !== '') {
      newStatus = 'TERHAMBAT';
    }

    const mergedProof = Array.from(
      new Set([...(currentData?.proofLinks || []), ...(proofLinks || [])])
    );

    await updateDoc(doc(db, COLLECTION_PATH, taskId), {
      progress,
      notes: notes || currentData?.notes || '',
      proofLinks: mergedProof,
      obstacles: obstacles || '',
      status: newStatus,
      approvalStatus: requestApproval ? 'MENUNGGU' : currentData?.approvalStatus || 'BELUM_DIAJUKAN',
      updatedAt: now,
      history: [
        ...currentHistory,
        {
          timestamp: now,
          userName,
          action: `Update Progres: ${progress}%`,
          note: notes || obstacles || (requestApproval ? 'Mengajukan persetujuan penyelesaian' : ''),
        },
      ],
    });

    await logAuditEvent(
      'UPDATE_PROGRES_TUGAS',
      `Progres tugas ${currentData?.taskId} diperbarui menjadi ${progress}% (${newStatus})`,
      'Task',
      taskId
    );

    // If requested approval, notify creator / managers
    if (requestApproval && currentData?.createdById && currentData.createdById !== currentUser?.uid) {
      await sendNotification(
        currentData.createdById,
        'PERSETUJUAN_DIPERLUKAN',
        `⏳ Menunggu Persetujuan: ${currentData.title}`,
        `${userName} telah menyelesaikan tugas (100%) dan menunggu verifikasi/persetujuan Anda.`,
        `/tasks?taskId=${taskId}`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function approveOrRejectTask(
  taskId: string,
  approved: boolean,
  approvalNote: string
): Promise<void> {
  const path = `${COLLECTION_PATH}/${taskId}`;
  try {
    const now = new Date().toISOString();
    const currentUser = auth.currentUser;
    const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Pimpinan';

    const currentDoc = await getDoc(doc(db, COLLECTION_PATH, taskId));
    const currentData = currentDoc.data() as Task | undefined;
    const currentHistory = currentData?.history || [];

    const newStatus: TaskStatus = approved ? 'SELESAI' : 'BERJALAN';

    await updateDoc(doc(db, COLLECTION_PATH, taskId), {
      status: newStatus,
      progress: approved ? 100 : currentData?.progress || 0,
      approvalStatus: approved ? 'DISETUJUI' : 'DITOLAK',
      approvalNote,
      updatedAt: now,
      history: [
        ...currentHistory,
        {
          timestamp: now,
          userName,
          action: approved ? 'Tugas Disetujui (Selesai)' : 'Persetujuan Ditolak (Perlu Revisi)',
          note: approvalNote,
        },
      ],
    });

    await logAuditEvent(
      approved ? 'PERSETUJUAN_TUGAS' : 'PENOLAKAN_TUGAS',
      `Tugas ${currentData?.taskId} ${approved ? 'disetujui' : 'ditolak'}: ${approvalNote}`,
      'Task',
      taskId
    );

    // Notify PIC
    if (currentData?.picId) {
      await sendNotification(
        currentData.picId,
        'TUGAS_SELESAI',
        approved ? `✅ Tugas Disetujui & Selesai: ${currentData.title}` : `⚠️ Revisi Tugas Diperlukan: ${currentData.title}`,
        approved
          ? `Tugas telah diverifikasi oleh ${userName}. Terima kasih atas kerja keras Anda.`
          : `Catatan perbaikan dari ${userName}: "${approvalNote}".`,
        `/tasks?taskId=${taskId}`
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  const path = `${COLLECTION_PATH}/${taskId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_PATH, taskId));
    await logAuditEvent('HAPUS_TUGAS', `Tugas ${taskId} dihapus oleh pengguna`, 'Task', taskId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
