import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { AppNotification, NotificationType, Task } from '../types';

export async function sendNotification(
  recipientUid: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
  dedupKey?: string
): Promise<void> {
  const collectionPath = 'notifications';
  try {
    // If a dedup key is provided, check if a notification with this key already exists
    if (dedupKey) {
      const q = query(
        collection(db, collectionPath),
        where('recipientUid', '==', recipientUid),
        where('notificationId', '==', dedupKey)
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        return; // Already notified
      }
    }

    const notificationId = dedupKey || `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await addDoc(collection(db, collectionPath), {
      notificationId,
      recipientUid,
      type,
      title,
      body,
      link: link || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getUserNotifications(recipientUid: string): Promise<AppNotification[]> {
  const collectionPath = 'notifications';
  try {
    const q = query(
      collection(db, collectionPath),
      where('recipientUid', '==', recipientUid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const collectionPath = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, collectionPath);
  }
}

export async function markAllNotificationsAsRead(recipientUid: string): Promise<void> {
  const collectionPath = 'notifications';
  try {
    const q = query(
      collection(db, collectionPath),
      where('recipientUid', '==', recipientUid),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, collectionPath);
  }
}

// In-app deadline evaluator triggered on app mount or refresh without double spamming
export async function evaluateDeadlinesForUser(userTasks: Task[], recipientUid: string) {
  if (!userTasks || userTasks.length === 0) return;

  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const today = new Date(`${todayStr}T00:00:00+07:00`);

  for (const task of userTasks) {
    if (task.status === 'SELESAI' || task.status === 'DIBATALKAN') continue;
    if (!task.deadline) continue;

    const deadline = new Date(`${task.deadline}T00:00:00+07:00`);
    const diffDays = Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Overdue
      const dedupKey = `DEADLINE_OVERDUE_${task.id}_${todayStr}`;
      await sendNotification(
        recipientUid,
        'DEADLINE_LEWAT',
        `⚠️ Tugas Terlambat: ${task.title}`,
        `Tugas ini telah melewati batas waktu pengerjaan (${task.deadline}). Segera laporkan kendala atau selesaikan.`,
        `/tasks?taskId=${task.id}`,
        dedupKey
      );
    } else if (diffDays === 0) {
      // Due today
      const dedupKey = `DEADLINE_TODAY_${task.id}_${todayStr}`;
      await sendNotification(
        recipientUid,
        'DEADLINE_MENDEKAT',
        `⏰ Batas Akhir Hari Ini: ${task.title}`,
        `Hari ini adalah deadline penyelesaian tugas. Pastikan progres di-update dan bukti hasil kerja diunggah.`,
        `/tasks?taskId=${task.id}`,
        dedupKey
      );
    } else if (diffDays === 1) {
      // 1 day left
      const dedupKey = `DEADLINE_1DAY_${task.id}_${todayStr}`;
      await sendNotification(
        recipientUid,
        'DEADLINE_MENDEKAT',
        `⏳ 1 Hari Lagi Menuju Deadline: ${task.title}`,
        `Tugas ini jatuh tempo besok (${task.deadline}). Periksa kembali persiapan dan kelengkapan.`,
        `/tasks?taskId=${task.id}`,
        dedupKey
      );
    } else if (diffDays === 2 || diffDays === 3) {
      const dedupKey = `DEADLINE_${diffDays}DAYS_${task.id}_${todayStr}`;
      await sendNotification(
        recipientUid,
        'DEADLINE_MENDEKAT',
        `📅 Pengingat ${diffDays} Hari: ${task.title}`,
        `Batas waktu pengerjaan tersisa ${diffDays} hari lagi (${task.deadline}).`,
        `/tasks?taskId=${task.id}`,
        dedupKey
      );
    }
  }
}
