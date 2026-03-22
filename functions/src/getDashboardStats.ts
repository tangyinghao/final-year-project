import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { verifyAdmin } from './adminAuth';

/**
 * Provides aggregate counts for the admin dashboard.
 */
export const getDashboardStats = https.onCall(async (request) => {
  await verifyAdmin(request.auth);

  const db = admin.firestore();

  const [
    pendingEventsSnap,
    pendingJobsSnap,
    pendingMentorshipsSnap,
    pendingReportsSnap,
    reviewedReportsSnap,
    activeUsersSnap,
    totalEventsSnap,
  ] = await Promise.all([
    db.collection('events').where('status', '==', 'pending').count().get(),
    db.collection('jobs').where('status', '==', 'pending').count().get(),
    db.collection('mentorships').where('status', '==', 'pending').count().get(),
    db.collection('reports').where('status', '==', 'pending').count().get(),
    db.collection('reports').where('status', '==', 'reviewed').count().get(),
    db.collection('users').where('status', '==', 'active').count().get(),
    db.collection('events').where('status', '==', 'approved').count().get(),
  ]);

  const pendingContent =
    pendingEventsSnap.data().count +
    pendingJobsSnap.data().count +
    pendingMentorshipsSnap.data().count;

  // Unresolved = pending + reviewed (not yet actioned or dismissed)
  const unresolvedReports =
    pendingReportsSnap.data().count +
    reviewedReportsSnap.data().count;

  return {
    pendingContent,
    unresolvedReports,
    activeUsers: activeUsersSnap.data().count,
    totalEvents: totalEventsSnap.data().count,
  };
});
