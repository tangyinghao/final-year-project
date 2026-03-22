import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

/**
 * Hard-deletes an event from the platform via Admin SDK.
 * Firestore rules block client deletes (allow delete: if false),
 * but Admin SDK bypasses rules.
 */
export const deleteEvent = https.onCall(async (request) => {
  await verifyAdmin(request.auth);

  const { eventId } = request.data as { eventId: string };

  if (!eventId || typeof eventId !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Missing eventId.');
  }

  const db = admin.firestore();
  const eventRef = db.collection('events').doc(eventId);
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    throw new https.HttpsError('not-found', 'Event not found.');
  }

  await eventRef.delete();

  return { success: true };
});
