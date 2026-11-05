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
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Donor, DonorCategory } from '../types';
import { logAuditEvent } from './auditService';

const COLLECTION_PATH = 'donors';

export function subscribeDonors(
  onUpdate: (donors: Donor[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const donors: Donor[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Donor, 'id'>),
        }));
        onUpdate(donors);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_PATH);
  }
}

export async function createDonor(
  donorData: Omit<Donor, 'id' | 'donorId' | 'totalDonations' | 'donationCount' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const donorId = `DNR-${randNum}`;

    const newDonor: Omit<Donor, 'id'> = {
      ...donorData,
      donorId,
      totalDonations: 0,
      donationCount: 0,
      firstDonationDate: donorData.firstDonationDate || now.split('T')[0],
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newDonor);

    await logAuditEvent(
      'TAMBAH_DONATUR',
      `Donatur baru ditambahkan: "${donorData.name}" (${donorData.category})`,
      'Donor',
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateDonor(donorId: string, updates: Partial<Donor>): Promise<void> {
  const path = `${COLLECTION_PATH}/${donorId}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, donorId), updates);
    await logAuditEvent('UPDATE_DONATUR', `Data donatur ${donorId} diperbarui`, 'Donor', donorId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function generateThankYouMessage(donorName: string, amount: number, campaignTitle?: string): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
    `Alhamdulillah, kami sampaikan terima kasih dan apresiasi setinggi-tingginya kepada Bapak/Ibu ${donorName} ` +
    `atas titipan donasi sebesar ${formatted} untuk ${campaignTitle ? `program "${campaignTitle}"` : 'kegiatan sosial Yayasan Indonesia Uluran Tangan'}.\n\n` +
    `Semoga Allah Ta'ala membalas kebaikan Bapak/Ibu dengan keberkahan yang berlipat ganda, kesehatan yang paripurna, serta menjadi amal jariyah yang senantiasa mengalir pahalanya. Aamiin ya Rabbal 'Alamin.\n\n` +
    `"Bergerak dengan Sistem, Melayani dengan Amanah."\n` +
    `Yayasan Indonesia Uluran Tangan (YIUT)`
  );
}
