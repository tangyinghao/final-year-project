import { onDocumentCreated } from 'firebase-functions/v2/firestore';

/**
 * Triggered when a new message is created in a chat.
 * Placeholder for future server-side message processing (e.g. push notifications).
 */
export const onNewMessage = onDocumentCreated(
  'chats/{chatId}/messages/{messageId}',
  async () => {
    // No-op: push notifications removed. Unread counts are managed client-side.
  }
);
