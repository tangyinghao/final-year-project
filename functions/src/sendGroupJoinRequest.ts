import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const MAX_PENDING_OUTBOUND = 5;

export const sendGroupJoinRequest = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const userId = request.auth.uid;
  const chatId = request.data?.chatId as string;

  if (!chatId) throw new https.HttpsError('invalid-argument', 'chatId is required');

  // Fetch user profile
  const userSnap = await db.doc(`users/${userId}`).get();
  if (!userSnap.exists) throw new https.HttpsError('not-found', 'User not found');
  const userData = userSnap.data()!;

  // Fetch group chat
  const chatSnap = await db.doc(`chats/${chatId}`).get();
  if (!chatSnap.exists) throw new https.HttpsError('not-found', 'Group not found');
  const chatData = chatSnap.data()!;

  if (chatData.type !== 'group') {
    throw new https.HttpsError('invalid-argument', 'Not a group chat');
  }
  if (chatData.listed !== true) {
    throw new https.HttpsError('failed-precondition', 'Group is not listed for discovery');
  }
  if ((chatData.participants || []).includes(userId)) {
    throw new https.HttpsError('already-exists', 'You are already in this group');
  }
  if (chatData.maxCapacity && chatData.participants.length >= chatData.maxCapacity) {
    throw new https.HttpsError('resource-exhausted', 'Group is full');
  }

  // Check max pending outbound
  const [chatReqSnap, groupReqSnap] = await Promise.all([
    db.collection('chatRequests')
      .where('senderId', '==', userId)
      .where('status', '==', 'pending')
      .get(),
    db.collection('groupJoinRequests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .get(),
  ]);

  const totalPending = chatReqSnap.size + groupReqSnap.size;
  if (totalPending >= MAX_PENDING_OUTBOUND) {
    throw new https.HttpsError('resource-exhausted', `You can have at most ${MAX_PENDING_OUTBOUND} pending requests`);
  }

  // Check no duplicate pending request to same group
  const existingSnap = await db.collection('groupJoinRequests')
    .where('userId', '==', userId)
    .where('chatId', '==', chatId)
    .where('status', '==', 'pending')
    .get();

  if (!existingSnap.empty) {
    throw new https.HttpsError('already-exists', 'You already have a pending request to this group');
  }

  const docRef = await db.collection('groupJoinRequests').add({
    userId,
    userName: userData.displayName,
    chatId,
    groupName: chatData.name || 'Group Chat',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { requestId: docRef.id };
});
