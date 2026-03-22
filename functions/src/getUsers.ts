import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

interface GetUsersRequest {
  limit: number;
  searchByEmailPrefix?: string;
  roleFilter?: 'student' | 'alumni' | 'admin';
  lastCursor?: { id: string; createdAt?: number; email?: string };
}

/**
 * Provides a searchable, paginated directory of all users.
 * Mutually exclusive: searchByEmailPrefix and roleFilter are not combined.
 */
export const getUsers = https.onCall(async (request) => {
  await verifyAdmin(request.auth);

  const { limit, searchByEmailPrefix, roleFilter, lastCursor } = request.data as GetUsersRequest;

  if (!limit || typeof limit !== 'number' || limit < 1) {
    throw new https.HttpsError('invalid-argument', 'A positive limit is required.');
  }

  const db = admin.firestore();
  let query: admin.firestore.Query = db.collection('users');

  if (searchByEmailPrefix) {
    // Email prefix search using Firestore range bounds
    query = query
      .where('email', '>=', searchByEmailPrefix)
      .where('email', '<=', searchByEmailPrefix + '\uf8ff')
      .orderBy('email', 'asc')
      .orderBy(admin.firestore.FieldPath.documentId(), 'asc');

    if (lastCursor?.email) {
      query = query.startAfter(lastCursor.email, lastCursor.id);
    }
  } else if (roleFilter) {
    // Role filter without search
    query = query
      .where('role', '==', roleFilter)
      .orderBy('createdAt', 'desc')
      .orderBy(admin.firestore.FieldPath.documentId(), 'desc');

    if (lastCursor?.createdAt) {
      query = query.startAfter(
        admin.firestore.Timestamp.fromMillis(lastCursor.createdAt),
        lastCursor.id
      );
    }
  } else {
    // Default: all users ordered by createdAt DESC
    query = query
      .orderBy('createdAt', 'desc')
      .orderBy(admin.firestore.FieldPath.documentId(), 'desc');

    if (lastCursor?.createdAt) {
      query = query.startAfter(
        admin.firestore.Timestamp.fromMillis(lastCursor.createdAt),
        lastCursor.id
      );
    }
  }

  const snap = await query.limit(limit + 1).get();
  const docs = snap.docs;
  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;

  const users = pageDocs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  let nextCursor: { id: string; createdAt?: number; email?: string } | null = null;
  if (hasMore) {
    const lastDoc = pageDocs[pageDocs.length - 1];
    const lastData = lastDoc.data();

    if (searchByEmailPrefix) {
      nextCursor = { id: lastDoc.id, email: lastData.email };
    } else {
      nextCursor = { id: lastDoc.id, createdAt: lastData.createdAt.toMillis() };
    }
  }

  return { users, nextCursor };
});
