import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

interface GetPendingContentRequest {
  limit: number;
  contentType?: 'events' | 'jobs' | 'mentorships';
  statusFilter?: 'pending' | 'approved' | 'rejected';
}

/**
 * Retrieves a unified list of content, optionally filtered by status.
 * Defaults to pending-only for backwards compatibility.
 */
export const getPendingContent = https.onCall({ cors: true }, async (request) => {
  await verifyAdmin(request.auth);

  const { limit, contentType, statusFilter } = request.data as GetPendingContentRequest;

  if (!limit || typeof limit !== 'number' || limit < 1) {
    throw new https.HttpsError('invalid-argument', 'A positive limit is required.');
  }

  const db = admin.firestore();
  const collections = contentType ? [contentType] : ['events', 'jobs', 'mentorships'];

  const queries = collections.map((coll) => {
    let query: admin.firestore.Query = db.collection(coll);

    // Only filter by status if an explicit filter was provided
    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    return query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
      .then((snap) =>
        snap.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, _collection: coll, ...data };
        })
      );
  });

  const results = await Promise.all(queries);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = results.flat();

  // If aggregating multiple collections, sort and slice to overall limit
  if (!contentType) {
    items.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
    items = items.slice(0, limit);
  }

  return { items };
});
