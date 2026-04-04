import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

interface UpdateReportStatusRequest {
  reportId: string;
  newStatus: 'actioned' | 'dismissed';
  suspendUser?: boolean;
  unsuspendUser?: boolean;
}

const VALID_STATUSES = new Set(['actioned', 'dismissed']);

/**
 * Updates the resolution state of a specific report.
 * Optionally suspends the reported user when actioning.
 */
export const updateReportStatus = https.onCall(async (request) => {
  const callerUid = await verifyAdmin(request.auth);

  const { reportId, newStatus, suspendUser, unsuspendUser } = request.data as UpdateReportStatusRequest;

  if (!reportId) {
    throw new https.HttpsError('invalid-argument', 'Missing reportId.');
  }

  if (!newStatus || !VALID_STATUSES.has(newStatus)) {
    throw new https.HttpsError('invalid-argument', 'Invalid newStatus. Must be actioned or dismissed.');
  }

  const db = admin.firestore();
  const reportRef = db.collection('reports').doc(reportId);
  const reportSnap = await reportRef.get();

  if (!reportSnap.exists) {
    throw new https.HttpsError('not-found', 'Report not found.');
  }

  const reportData = reportSnap.data()!;

  // If suspending, update the reported user's status
  if (suspendUser && reportData.reportedUserId) {
    const userRef = db.collection('users').doc(reportData.reportedUserId);
    await userRef.update({ status: 'suspended' });
  }

  // If unsuspending, restore the reported user's status
  if (unsuspendUser && reportData.reportedUserId) {
    const userRef = db.collection('users').doc(reportData.reportedUserId);
    await userRef.update({ status: 'active' });
  }

  await reportRef.update({
    status: newStatus,
    reviewedBy: callerUid,
    reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const updatedSnap = await reportRef.get();

  return {
    success: true,
    report: { id: updatedSnap.id, ...updatedSnap.data() },
  };
});
