import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';

export const joinGroup = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const userId = request.auth.uid;
  const chatId = request.data?.chatId as string;

  if (!chatId) throw new https.HttpsError('invalid-argument', 'chatId is required');

  // Fetch group chat
  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();
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

  // Add user to group in a transaction (with capacity check)
  await db.runTransaction(async (tx) => {
    const freshChat = await tx.get(chatRef);
    if (!freshChat.exists) throw new https.HttpsError('not-found', 'Group not found');
    const freshData = freshChat.data()!;

    if (freshData.maxCapacity && freshData.participants.length >= freshData.maxCapacity) {
      throw new https.HttpsError('resource-exhausted', 'Group is full');
    }

    tx.update(chatRef, {
      participants: admin.firestore.FieldValue.arrayUnion(userId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return { status: 'joined', chatId };
});
