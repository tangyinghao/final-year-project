import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export async function submitReport(
  reportedUserId: string,
  reportedBy: string,
  reason: string,
  additionalDetails: string,
  reportedUserName?: string,
  reportedByName?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, 'reports'), {
    reportedUserId,
    reportedBy,
    reason,
    additionalDetails,
    reportedUserName: reportedUserName || null,
    reportedByName: reportedByName || null,
    status: 'pending',
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
  });
  return docRef.id;
}
