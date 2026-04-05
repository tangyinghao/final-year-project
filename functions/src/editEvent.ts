import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

// Fields that must never be updated by editEvent
const PROTECTED_FIELDS = new Set([
  'id',
  'createdBy',
  'createdAt',
  'attendees',
  'attendeeCount',
]);

/**
 * Updates details of an existing event (official or user-created).
 */
export const editEvent = https.onCall({ cors: true }, async (request) => {
  await verifyAdmin(request.auth);

  const { eventId, updates } = request.data as {
    eventId: string;
    updates: Record<string, unknown>;
  };

  if (!eventId || typeof eventId !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Missing eventId.');
  }

  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new https.HttpsError('invalid-argument', 'Updates object is required and must not be empty.');
  }

  // Strip protected fields
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (!PROTECTED_FIELDS.has(key)) {
      sanitized[key] = value;
    }
  }

  if (Object.keys(sanitized).length === 0) {
    throw new https.HttpsError('invalid-argument', 'No updatable fields provided.');
  }

  const db = admin.firestore();
  const eventRef = db.collection('events').doc(eventId);
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    throw new https.HttpsError('not-found', 'Event not found.');
  }

  // Convert date field from millis if provided
  if (sanitized.date && typeof sanitized.date === 'number') {
    sanitized.date = admin.firestore.Timestamp.fromMillis(sanitized.date as number);
  }

  sanitized.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  await eventRef.update(sanitized);

  return { success: true, eventId };
});
