import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const respondChatRequest = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const callerId = request.auth.uid;
  const requestId = request.data?.requestId as string;
  const action = request.data?.action as 'accept' | 'decline' | 'cancel';

  if (!requestId) throw new https.HttpsError('invalid-argument', 'requestId is required');
  if (!['accept', 'decline', 'cancel'].includes(action)) {
    throw new https.HttpsError('invalid-argument', 'action must be accept, decline, or cancel');
  }

  const reqRef = db.collection('chatRequests').doc(requestId);
  const reqSnap = await reqRef.get();
  if (!reqSnap.exists) throw new https.HttpsError('not-found', 'Request not found');
  const reqData = reqSnap.data()!;

  if (reqData.status !== 'pending') {
    throw new https.HttpsError('failed-precondition', 'Request is no longer pending');
  }

  if (action === 'cancel') {
    if (reqData.senderId !== callerId) {
      throw new https.HttpsError('permission-denied', 'Only the sender can cancel');
    }
    await reqRef.update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 'cancelled' };
  }

  if (action === 'decline') {
    if (reqData.recipientId !== callerId) {
      throw new https.HttpsError('permission-denied', 'Only the recipient can decline');
    }
    await reqRef.update({
      status: 'declined',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: 'declined' };
  }

  // Accept
  if (reqData.recipientId !== callerId) {
    throw new https.HttpsError('permission-denied', 'Only the recipient can accept');
  }

  // Use transaction to check for existing chat or create new one
  const chatId = await db.runTransaction(async (tx) => {
    // Re-read request inside transaction
    const freshReq = await tx.get(reqRef);
    if (!freshReq.exists || freshReq.data()!.status !== 'pending') {
      throw new https.HttpsError('failed-precondition', 'Request is no longer pending');
    }

    const senderId = reqData.senderId;
    const recipientId = reqData.recipientId;
    const participants = [senderId, recipientId].sort();

    // Check if direct chat already exists
    const existingChats = await tx.get(
      db.collection('chats')
        .where('type', '==', 'direct')
        .where('participants', '==', participants)
    );

    let chatRef: admin.firestore.DocumentReference;

    if (!existingChats.empty) {
      chatRef = existingChats.docs[0].ref;
    } else {
      chatRef = db.collection('chats').doc();
      tx.set(chatRef, {
        type: 'direct',
        participants,
        name: null,
        createdBy: senderId,
        matchType: 'algorithm',
        cohortYear: null,
        lastMessage: null,
        unreadCount: {},
        owner: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    tx.update(reqRef, {
      status: 'accepted',
      chatId: chatRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return chatRef.id;
  });

  return { status: 'accepted', chatId };
});
