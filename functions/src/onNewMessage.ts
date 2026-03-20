import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Triggered when a new message is created in a chat.
 * Sends Expo push notifications to all other participants who have notifications enabled.
 */
export const onNewMessage = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { chatId } = context.params;
    const senderId = message.senderId;
    const senderName = message.senderName || 'Someone';
    const text = message.text || '';

    // Get the chat to find participants
    const chatSnap = await db.doc(`chats/${chatId}`).get();
    if (!chatSnap.exists) return;
    const chat = chatSnap.data()!;
    const participants: string[] = chat.participants || [];

    // Get all other participants' user docs
    const otherUids = participants.filter((uid: string) => uid !== senderId);
    if (otherUids.length === 0) return;

    // Fetch user profiles to get push tokens
    const userSnaps = await Promise.all(
      otherUids.map((uid: string) => db.doc(`users/${uid}`).get())
    );

    const pushMessages: Array<{
      to: string;
      sound: string;
      title: string;
      body: string;
      data: Record<string, string>;
    }> = [];

    for (const userSnap of userSnaps) {
      if (!userSnap.exists) continue;
      const userData = userSnap.data()!;
      const token = userData.expoPushToken;
      const enabled = userData.notificationsEnabled !== false; // default true

      if (token && enabled) {
        const chatName = chat.type === 'direct' ? senderName : (chat.name || 'Group Chat');
        const body = chat.type === 'direct'
          ? text
          : `${senderName}: ${text}`;

        pushMessages.push({
          to: token,
          sound: 'default',
          title: chatName,
          body: body.length > 100 ? body.substring(0, 100) + '...' : body,
          data: { chatId, type: 'message' },
        });
      }
    }

    if (pushMessages.length === 0) return;

    // Send via Expo push notification service
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessages),
    });

    if (!response.ok) {
      console.error('Failed to send push notifications:', await response.text());
    }
  });
