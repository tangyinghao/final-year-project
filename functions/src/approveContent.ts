import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';

interface ApproveRequest {
  contentType: 'event' | 'job' | 'mentorship';
  contentId: string;
  action: 'approve' | 'reject';
}

// Admins approve or reject pending content
export const approveContent = https.onCall(async (request) => {
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

  const { contentType, contentId, action } = request.data as ApproveRequest;

  if (!contentType || !contentId || !action) {
    throw new https.HttpsError('invalid-argument', 'Missing contentType, contentId, or action.');
  }

  // Determine collection
  const collectionMap: Record<string, string> = {
    event: 'events',
    job: 'jobs',
    mentorship: 'mentorships',
  };
  const collName = collectionMap[contentType];
  if (!collName) {
    throw new https.HttpsError('invalid-argument', 'Invalid contentType.');
  }

  const docRef = db.collection(collName).doc(contentId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new https.HttpsError('not-found', 'Content not found.');
  }

  const docData = docSnap.data()!;
  if (docData.status !== 'pending') {
    throw new https.HttpsError('failed-precondition', 'Content is not pending.');
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  await docRef.update({
    status: newStatus,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notify the content creator
  const creatorId = docData.createdBy || docData.postedBy || docData.mentorId;
  if (creatorId) {
    await db.collection('notifications').add({
      userId: creatorId,
      type: 'approval',
      title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} ${newStatus}`,
      body: `Your ${contentType} "${docData.title}" has been ${newStatus}.`,
      data: { route: `/${collName}/${contentId}` },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { success: true, status: newStatus };
});
