import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

interface CreateOfficialEventRequest {
  title: string;
  description: string;
  date: number; // epoch millis from client
  location: string;
  maxCapacity: number | null;
  coverImage: string | null;
}

/**
 * Allows admins to create official NTU events that bypass moderation.
 */
export const createOfficialEvent = https.onCall({ cors: true }, async (request) => {
  const callerUid = await verifyAdmin(request.auth);

  const data = request.data as CreateOfficialEventRequest;

  if (!data.title || typeof data.title !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Title is required.');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Description is required.');
  }
  if (!data.date || typeof data.date !== 'number') {
    throw new https.HttpsError('invalid-argument', 'Date is required (epoch millis).');
  }
  if (!data.location || typeof data.location !== 'string') {
    throw new https.HttpsError('invalid-argument', 'Location is required as a string.');
  }

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const eventDoc = await db.collection('events').add({
    title: data.title,
    description: data.description,
    type: 'official',
    status: 'approved',
    date: admin.firestore.Timestamp.fromMillis(data.date),
    location: data.location,
    coverImage: data.coverImage ?? null,
    maxCapacity: data.maxCapacity ?? null,
    createdBy: callerUid,
    creatorName: 'MSCircle Admin',
    attendees: [],
    attendeeCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true, eventId: eventDoc.id };
});
