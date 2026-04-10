import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const MAX_PENDING_OUTBOUND = 5;

export const sendChatRequest = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const senderId = request.auth.uid;
  const recipientId = request.data?.recipientId as string;
  const introNote = (request.data?.introNote as string) || null;

  if (!recipientId) throw new https.HttpsError('invalid-argument', 'recipientId is required');
  if (senderId === recipientId) throw new https.HttpsError('invalid-argument', 'Cannot send request to yourself');

  // Fetch sender profile
  const senderSnap = await db.doc(`users/${senderId}`).get();
  if (!senderSnap.exists) throw new https.HttpsError('not-found', 'Sender not found');
  const senderData = senderSnap.data()!;

  // Fetch recipient profile
  const recipientSnap = await db.doc(`users/${recipientId}`).get();
  if (!recipientSnap.exists) throw new https.HttpsError('not-found', 'Recipient not found');
  const recipientData = recipientSnap.data()!;

  if (recipientData.matchingEnabled !== true) {
    throw new https.HttpsError('failed-precondition', 'This user has not enabled smart match');
  }

  // Check max pending outbound (chatRequests + groupJoinRequests)
  const [chatReqSnap, groupReqSnap] = await Promise.all([
    db.collection('chatRequests')
      .where('senderId', '==', senderId)
      .where('status', '==', 'pending')
      .get(),
    db.collection('groupJoinRequests')
      .where('userId', '==', senderId)
      .where('status', '==', 'pending')
      .get(),
  ]);

  const totalPending = chatReqSnap.size + groupReqSnap.size;
  if (totalPending >= MAX_PENDING_OUTBOUND) {
    throw new https.HttpsError('resource-exhausted', `You can have at most ${MAX_PENDING_OUTBOUND} pending requests`);
  }

  // Check no duplicate pending request
  const existingSnap = await db.collection('chatRequests')
    .where('senderId', '==', senderId)
    .where('recipientId', '==', recipientId)
    .where('status', '==', 'pending')
    .get();

  if (!existingSnap.empty) {
    throw new https.HttpsError('already-exists', 'You already have a pending request to this user');
  }

  const docRef = await db.collection('chatRequests').add({
    senderId,
    senderName: senderData.displayName,
    recipientId,
    recipientName: recipientData.displayName,
    introNote,
    status: 'pending',
    chatId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { requestId: docRef.id };
});
