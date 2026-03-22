import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * Verifies the caller is authenticated and has role === 'admin'
 * by reading the user's Firestore document via Admin SDK.
 * Throws HttpsError if not authenticated or not an admin.
 */
export async function verifyAdmin(auth: { uid: string } | undefined): Promise<string> {
  if (!auth) {
    throw new https.HttpsError('unauthenticated', 'Must be authenticated.');
  }

  const callerSnap = await admin.firestore().collection('users').doc(auth.uid).get();
  const callerData = callerSnap.data();
  if (!callerData || callerData.role !== 'admin') {
    throw new https.HttpsError('permission-denied', 'Admin access required.');
  }

  return auth.uid;
}
