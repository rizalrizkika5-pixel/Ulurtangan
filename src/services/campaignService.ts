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
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Campaign, CampaignStatus, ProgramType } from '../types';
import { logAuditEvent } from './auditService';
import { createTask } from './taskService';

const COLLECTION_PATH = 'campaigns';

export function subscribeCampaigns(
  onUpdate: (campaigns: Campaign[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const campaigns: Campaign[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Campaign, 'id'>),
        }));
        onUpdate(campaigns);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
  }
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Campaign, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
  }
}

export async function createCampaign(
  campaignData: Omit<Campaign, 'id' | 'campaignId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const campaignId = `CMP-${new Date().getFullYear()}-${randNum}`;

    const newCampaign: Omit<Campaign, 'id'> = {
      ...campaignData,
      campaignId,
      collectedAmount: campaignData.collectedAmount || 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newCampaign);

    await logAuditEvent(
      'PEMBUATAN_CAMPAIGN',
      `Campaign baru dibuat: "${campaignData.title}" (${campaignData.programType}) Target: Rp ${campaignData.targetAmount.toLocaleString('id-ID')}`,
      'Campaign',
      docRef.id
    );

    // Automation workflow trigger: When fundraising starts, automatically create fundraising & content tasks
    if (campaignData.status === 'FUNDRAISING' || campaignData.status === 'PERSIAPAN_FUNDRAISING') {
      try {
        await createTask({
          title: `[Fundraising] Penyusunan Strategi & Publikasi: ${campaignData.title}`,
          description: `Buat narasi fundraising, tentukan kanal promosi, dan siapkan kanal donasi untuk campaign ${campaignData.title}.`,
          department: 'FUNDRAISING',
          campaignId: docRef.id,
          campaignTitle: campaignData.title,
          picId: campaignData.picFundraisingId,
          picName: campaignData.picFundraisingName,
          createdById: 'SYSTEM_AUTOMATION',
          createdByName: 'Workflow Automation YIUT',
          priority: 'TINGGI',
          status: 'SIAP_DIKERJAKAN',
          deadline: campaignData.deadline,
          progress: 0,
        });
      } catch (err) {
        console.warn('Auto task creation skipped:', err);
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<void> {
  const path = `${COLLECTION_PATH}/${campaignId}`;
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, COLLECTION_PATH, campaignId), {
      ...updates,
      updatedAt: now,
    });
    await logAuditEvent(
      'UPDATE_CAMPAIGN',
      `Campaign ${campaignId} diperbarui`,
      'Campaign',
      campaignId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const path = `${COLLECTION_PATH}/${campaignId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_PATH, campaignId));
    await logAuditEvent('HAPUS_CAMPAIGN', `Campaign ${campaignId} dihapus`, 'Campaign', campaignId);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
