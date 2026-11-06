import {
  collection,
  doc,
  getDocs,
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
import { Assessment, AssessmentStatus } from '../types';
import { logAuditEvent } from './auditService';
import { createCampaign } from './campaignService';

const COLLECTION_PATH = 'assessments';

export function subscribeAssessments(
  onUpdate: (items: Assessment[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: Assessment[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Assessment, 'id'>),
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

export async function createAssessment(
  data: Omit<Assessment, 'id' | 'assessmentId' | 'createdAt'>
): Promise<string> {
  try {
    const now = new Date().toISOString();
    const randNum = Math.floor(100 + Math.random() * 900);
    const assessmentId = `ASM-${new Date().getFullYear()}-${randNum}`;

    const newAssessment: Omit<Assessment, 'id'> = {
      ...data,
      assessmentId,
      createdAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_PATH), newAssessment);

    await logAuditEvent(
      'ASSESSMENT_BARU',
      `Assessment penerima manfaat dicatat: "${data.needType}" di ${data.location}`,
      'Assessment',
      docRef.id
    );

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function updateAssessment(
  assessmentId: string,
  updates: Partial<Assessment>
): Promise<void> {
  const path = `${COLLECTION_PATH}/${assessmentId}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, assessmentId), updates);
    await logAuditEvent(
      'UPDATE_ASSESSMENT',
      `Assessment ${assessmentId} diperbarui datanya`,
      'Assessment',
      assessmentId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAssessment(assessmentId: string): Promise<void> {
  const path = `${COLLECTION_PATH}/${assessmentId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_PATH, assessmentId));
    await logAuditEvent(
      'HAPUS_ASSESSMENT',
      `Assessment ${assessmentId} dihapus`,
      'Assessment',
      assessmentId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateAssessmentStatus(
  assessmentId: string,
  status: AssessmentStatus,
  verificationNotes?: string
): Promise<void> {
  const path = `${COLLECTION_PATH}/${assessmentId}`;
  try {
    await updateDoc(doc(db, COLLECTION_PATH, assessmentId), {
      status,
      verificationNotes: verificationNotes || '',
    });
    await logAuditEvent(
      'VERIFIKASI_ASSESSMENT',
      `Assessment ${assessmentId} diubah status menjadi ${status}`,
      'Assessment',
      assessmentId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Convert an approved assessment into a campaign automatically
export async function convertAssessmentToCampaign(
  assessment: Assessment,
  title: string,
  programType: any,
  targetAmount: number,
  picProgramId: string,
  picProgramName: string,
  picFundraisingId: string,
  picFundraisingName: string,
  deadline: string
): Promise<string> {
  const campaignId = await createCampaign({
    title,
    programType,
    description: assessment.problemDescription,
    background: `Hasil assessment lapangan (${assessment.assessmentId}): ${assessment.recommendations}`,
    location: assessment.location,
    targetBeneficiaries: assessment.targetCount,
    targetBeneficiaryDescription: assessment.eligibilityCriteria,
    picProgramId,
    picProgramName,
    picFundraisingId,
    picFundraisingName,
    targetAmount,
    collectedAmount: 0,
    budgetApproved: targetAmount,
    startDate: new Date().toISOString().split('T')[0],
    deadline,
    status: 'PERSETUJUAN',
  });

  // Link assessment to campaign
  await updateDoc(doc(db, COLLECTION_PATH, assessment.id), {
    linkedCampaignId: campaignId,
    status: 'DISETUJUI',
  });

  return campaignId;
}
