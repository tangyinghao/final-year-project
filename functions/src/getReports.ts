import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

interface GetReportsRequest {
  limit: number;
  statusFilter?: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  lastCursor?: { id: string; createdAt: number };
}

/**
 * Retrieves a paginated list of user reports.
 */
export const getReports = https.onCall(async (request) => {
  await verifyAdmin(request.auth);

  const { limit, statusFilter, lastCursor } = request.data as GetReportsRequest;

  if (!limit || typeof limit !== 'number' || limit < 1) {
    throw new https.HttpsError('invalid-argument', 'A positive limit is required.');
  }

  const db = admin.firestore();
  let query: admin.firestore.Query = db.collection('reports');

  if (statusFilter) {
    query = query.where('status', '==', statusFilter);
  }

  // Order by createdAt DESC, then document __name__ DESC for stable pagination
  query = query.orderBy('createdAt', 'desc').orderBy(admin.firestore.FieldPath.documentId(), 'desc');

  if (lastCursor) {
    query = query.startAfter(
      admin.firestore.Timestamp.fromMillis(lastCursor.createdAt),
      lastCursor.id
    );
  }

  // Fetch limit + 1 to determine if there's a next page
  const snap = await query.limit(limit + 1).get();
  const docs = snap.docs;
  const hasMore = docs.length > limit;
  const pageDocs = hasMore ? docs.slice(0, limit) : docs;

  // Resolve user display names for reportedUserId and reportedBy
  const userIds = new Set<string>();
  for (const doc of pageDocs) {
    const d = doc.data();
    if (d.reportedUserId) userIds.add(d.reportedUserId);
    if (d.reportedBy) userIds.add(d.reportedBy);
  }

  const nameMap: Record<string, string> = {};
  const userIdArr = Array.from(userIds);
  // Firestore getAll supports up to 100 refs at a time
  if (userIdArr.length > 0) {
    const userRefs = userIdArr.map((uid) => db.collection('users').doc(uid));
    const userSnaps = await db.getAll(...userRefs);
    for (const snap of userSnaps) {
      if (snap.exists) {
        const userData = snap.data();
        nameMap[snap.id] = userData?.displayName || userData?.email || snap.id;
      }
    }
  }

  const reports = pageDocs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      reportedUserName: nameMap[data.reportedUserId] || null,
      reportedByName: nameMap[data.reportedBy] || null,
    };
  });

  let nextCursor: { id: string; createdAt: number } | null = null;
  if (hasMore) {
    const lastDoc = pageDocs[pageDocs.length - 1];
    const lastData = lastDoc.data();
    nextCursor = {
      id: lastDoc.id,
      createdAt: lastData.createdAt.toMillis(),
    };
  }

  return { reports, nextCursor };
});
