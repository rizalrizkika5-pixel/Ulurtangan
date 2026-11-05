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
import { Donation, DonationStatus } from '../types';
import { logAuditEvent } from './auditService';
import { updateDonor } from './crmService';

const COLLECTION_PATH = 'donations';

export function subscribeDonations(
  onUpdate: (donations: Donation[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const donations: Donation[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Donation, 'id'>),
        }));
        onUpdate(donations);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
  }
}

export async function createDonation(
  donationData: Omit<Donation, 'id' | 'donationId' | 'status' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const donationId = `TRX-${new Date().getFullYear()}-${randNum}`;

    const newDonation: Omit<Donation, 'id'> = {
      ...donationData,
      donationId,
      status: 'MENUNGGU_VERIFIKASI',
      thankYouSent: false,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newDonation);

    await logAuditEvent(
      'CATAT_DONASI',
      `Donasi Rp ${donationData.amount.toLocaleString('id-ID')} dicatat oleh ${donationData.recorderName} dari ${donationData.donorName} (${donationData.fundType})`,
      'Donation',
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

// Verification function by supervisor/finance verifier
export async function verifyDonation(
  donationId: string,
  approved: boolean,
  notes?: string
): Promise<void> {
  const path = `${COLLECTION_PATH}/${donationId}`;
  try {
    const currentUser = auth.currentUser;
    const verifierName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Verifikator Keuangan';
    const verifierId = currentUser?.uid || 'UNKNOWN';

    const currentDoc = await getDoc(doc(db, COLLECTION_PATH, donationId));
    if (!currentDoc.exists()) throw new Error('Data donasi tidak ditemukan');
    const data = currentDoc.data() as Donation;

    const newStatus: DonationStatus = approved ? 'TERVERIFIKASI' : 'DITOLAK';

    await updateDoc(doc(db, COLLECTION_PATH, donationId), {
      status: newStatus,
      verifierId,
      verifierName,
      notes: notes || data.notes || '',
    });

    // If verified, increment campaign collectedAmount and donor total
    if (approved) {
      if (data.campaignId) {
        try {
          await updateDoc(doc(db, 'campaigns', data.campaignId), {
            collectedAmount: increment(data.amount),
          });
        } catch (e) {
          console.warn('Could not increment campaign amount:', e);
        }
      }

      if (data.donorId) {
        try {
          await updateDoc(doc(db, 'donors', data.donorId), {
            totalDonations: increment(data.amount),
            donationCount: increment(1),
          });
        } catch (e) {
          console.warn('Could not increment donor amount:', e);
        }
      }
    }

    await logAuditEvent(
      approved ? 'VERIFIKASI_DONASI_DISETUJUI' : 'VERIFIKASI_DONASI_DITOLAK',
      `Transaksi ${data.donationId} (${newStatus}) oleh ${verifierName}`,
      'Donation',
      donationId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markThankYouSent(donationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION_PATH, donationId), { thankYouSent: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PATH}/${donationId}`);
  }
}
