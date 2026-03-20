import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDoc,
  getDocs,
  limit,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Chat, Message } from '@/types';

// ── Fetch chats where user is a participant ──────────────────────────
export function subscribeToChats(
  userId: string,
  callback: (chats: Chat[]) => void
) {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const chats: Chat[] = [];
    snap.forEach((d) => chats.push({ id: d.id, ...d.data() } as Chat));
    callback(chats);
  });
}

// ── Subscribe to messages in a chat ──────────────────────────────────
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const messages: Message[] = [];
    snap.forEach((d) => messages.push({ id: d.id, ...d.data() } as Message));
    callback(messages);
  });
}

// ── Send a message ───────────────────────────────────────────────────
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> {
  const msgRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(msgRef, {
    senderId,
    senderName,
    text,
    type: 'text',
    imageUrl: null,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });

  // Update chat's lastMessage and mark unread for other participants
  const chatSnap = await getDoc(doc(db, 'chats', chatId));
  const chatData = chatSnap.data();
  const otherParticipants = (chatData?.participants || []).filter((p: string) => p !== senderId);
  const unreadBy = otherParticipants.reduce((acc: Record<string, boolean>, uid: string) => {
    acc[uid] = true;
    return acc;
  }, {} as Record<string, boolean>);

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: {
      text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
    },
    unreadBy,
    updatedAt: serverTimestamp(),
  });
}

// ── Create a direct chat ─────────────────────────────────────────────
export async function createDirectChat(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  // Check if direct chat already exists between these two users
  const q = query(
    collection(db, 'chats'),
    where('type', '==', 'direct'),
    where('participants', 'array-contains', currentUserId)
  );
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const chat = d.data() as Chat;
    if (chat.participants.includes(otherUserId) && chat.participants.length === 2) {
      return d.id;
    }
  }

  // Create new direct chat
  const chatDoc = await addDoc(collection(db, 'chats'), {
    type: 'direct',
    participants: [currentUserId, otherUserId],
    name: null,
    createdBy: currentUserId,
    matchType: 'manual',
    cohortYear: null,
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return chatDoc.id;
}

// ── Create a group chat ──────────────────────────────────────────────
export async function createGroupChat(
  currentUserId: string,
  participantIds: string[],
  groupName: string,
  matchType: 'manual' | 'algorithm' = 'manual'
): Promise<string> {
  const allParticipants = Array.from(new Set([currentUserId, ...participantIds]));
  const chatDoc = await addDoc(collection(db, 'chats'), {
    type: 'group',
    participants: allParticipants,
    name: groupName,
    createdBy: currentUserId,
    matchType,
    cohortYear: null,
    lastMessage: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return chatDoc.id;
}

// ── Get single chat ──────────────────────────────────────────────────
export async function getChat(chatId: string): Promise<Chat | null> {
  const snap = await getDoc(doc(db, 'chats', chatId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Chat) : null;
}

// ── Get chat participants ────────────────────────────────────────────
export async function getChatParticipantIds(chatId: string): Promise<string[]> {
  const chat = await getChat(chatId);
  return chat?.participants ?? [];
}

// ── Mark messages as read ────────────────────────────────────────────
export async function markMessagesAsRead(
  chatId: string,
  messageIds: string[],
  userId: string
): Promise<void> {
  for (const msgId of messageIds) {
    await updateDoc(doc(db, 'chats', chatId, 'messages', msgId), {
      readBy: arrayUnion(userId),
    });
  }
}

// ── Mark chat as read for a user ────────────────────────────────────
export async function markChatAsRead(
  chatId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, 'chats', chatId), {
    [`unreadBy.${userId}`]: false,
  });
}
