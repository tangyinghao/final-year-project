import { firestore } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * Notifies admin users when a new report is submitted.
 */
export const onReportCreate = firestore.onDocumentCreated(
  'reports/{reportId}',
  async (event) => {
    const report = event.data?.data();
    if (!report) return;

    const db = admin.firestore();

    // Query admin users
    const adminsSnap = await db
      .collection('users')
      .where('role', '==', 'admin')
      .get();

    const batch = db.batch();
    adminsSnap.docs.forEach((adminDoc) => {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        userId: adminDoc.id,
        type: 'report',
        title: 'New User Report',
        body: `A user has been reported for: ${report.reason}`,
        data: { route: '/admin/reports', reportId: event.params.reportId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }
);
