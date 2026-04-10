import * as admin from 'firebase-admin';
import { https } from 'firebase-functions/v2';

export const leaveGroup = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const callerId = request.auth.uid;
  const chatId = request.data?.chatId as string;
  const targetUserId = (request.data?.targetUserId as string) || callerId;

  if (!chatId) throw new https.HttpsError('invalid-argument', 'chatId is required');

  const chatRef = db.doc(`chats/${chatId}`);
  const chatSnap = await chatRef.get();
  if (!chatSnap.exists) throw new https.HttpsError('not-found', 'Group not found');
  const chatData = chatSnap.data()!;

  if (chatData.type !== 'group') {
    throw new https.HttpsError('invalid-argument', 'Not a group chat');
  }

  if (!chatData.participants.includes(callerId)) {
    throw new https.HttpsError('permission-denied', 'You are not in this group');
  }

  // If removing another user, must be owner
  if (targetUserId !== callerId && chatData.owner !== callerId) {
    throw new https.HttpsError('permission-denied', 'Only the group owner can remove members');
  }

  if (!chatData.participants.includes(targetUserId)) {
    throw new https.HttpsError('not-found', 'User is not in this group');
  }

  await db.runTransaction(async (tx) => {
    const freshChat = await tx.get(chatRef);
    if (!freshChat.exists) return;
    const freshData = freshChat.data()!;

    const remainingParticipants = (freshData.participants as string[]).filter(
      (uid: string) => uid !== targetUserId
    );

    if (remainingParticipants.length === 0) {
      // Last member leaving: delete the chat
      tx.delete(chatRef);
      return;
    }

    const updates: Record<string, any> = {
      participants: admin.firestore.FieldValue.arrayRemove(targetUserId),
      [`unreadCount.${targetUserId}`]: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Transfer ownership if the leaving user is the owner
    if (freshData.owner === targetUserId) {
      updates.owner = remainingParticipants[0];
    }

    tx.update(chatRef, updates);
  });

  return { status: 'left' };
});
