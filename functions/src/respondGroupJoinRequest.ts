import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';

export const respondGroupJoinRequest = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const callerId = request.auth.uid;
  const requestId = request.data?.requestId as string;
  const action = request.data?.action as 'approve' | 'decline' | 'cancel';

  if (!requestId) throw new https.HttpsError('invalid-argument', 'requestId is required');
  if (!['approve', 'decline', 'cancel'].includes(action)) {
    throw new https.HttpsError('invalid-argument', 'action must be approve, decline, or cancel');
  }

  const reqRef = db.collection('groupJoinRequests').doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new https.HttpsError('not-found', 'Request not found');
  const reqData = reqSnap.data()!;

  if (reqData.status !== 'pending') {
    throw new https.HttpsError('failed-precondition', 'Request is no longer pending');
  }

  if (action === 'cancel') {
    if (reqData.userId !== callerId) {
      throw new https.HttpsError('permission-denied', 'Only the requester can cancel');
    }
    await reqRef.update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 'cancelled' };
  }

  // Approve or decline: must be group owner
  const chatRef = db.doc(`chats/${reqData.chatId}`);
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) throw new https.HttpsError('not-found', 'Group not found');
  const chatData = chatSnap.data()!;

  if (chatData.owner !== callerId) {
    throw new https.HttpsError('permission-denied', 'Only the group owner can approve or decline');
  }

  if (action === 'decline') {
    await reqRef.update({
      status: 'declined',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 'declined' };
  }

  // Approve: add user to group in a transaction
  await db.runTransaction(async (tx) => {
    const freshChat = await tx.get(chatRef);
    if (!freshChat.exists) throw new https.HttpsError('not-found', 'Group not found');
    const freshData = freshChat.data()!;

    if (freshData.maxCapacity && freshData.participants.length >= freshData.maxCapacity) {
      throw new https.HttpsError('resource-exhausted', 'Group is now full');
    }

    tx.update(chatRef, {
      participants: admin.firestore.FieldValue.arrayUnion(reqData.userId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    tx.update(reqRef, {
      status: 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return { status: 'approved' };
});
