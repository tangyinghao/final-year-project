import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

interface SuspendRequest {
  targetUid: string;
  suspend: boolean; // true = suspend, false = unsuspend
}

/**
 * Callable function for admins to suspend or unsuspend a user.
 */
export const suspendUser = https.onCall(async (request) => {
  const db = admin.firestore();

  // Auth check
  if (!request.auth) {
    throw new https.HttpsError('unauthenticated', 'Must be authenticated.');
  }

  // Admin check via Firestore role
  const callerSnap = await db.collection('users').doc(request.auth.uid).get();
  const callerData = callerSnap.data();
  if (!callerData || callerData.role !== 'admin') {
    throw new https.HttpsError('permission-denied', 'Admin access required.');
  }

  const { targetUid, suspend } = request.data as SuspendRequest;

  if (!targetUid) {
    throw new https.HttpsError('invalid-argument', 'Missing targetUid.');
  }

  // Cannot suspend yourself
  if (targetUid === request.auth.uid) {
    throw new https.HttpsError('invalid-argument', 'Cannot suspend yourself.');
  }

  // Target must exist
  const targetRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetRef.get();
  if (!targetSnap.exists) {
    throw new https.HttpsError('not-found', 'Target user not found.');
  }

  // Cannot suspend another admin
  const targetData = targetSnap.data();
  if (targetData?.role === 'admin' && suspend) {
    throw new https.HttpsError('permission-denied', 'Cannot suspend an admin user.');
  }

  const newStatus = suspend ? 'suspended' : 'active';

  // Update Firestore status
  await targetRef.update({
    status: newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Optionally disable/enable Firebase Auth account
  await admin.auth().updateUser(targetUid, { disabled: suspend });

  return { success: true, status: newStatus };
});
