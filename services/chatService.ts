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
  increment,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebaseConfig';
import { Chat, Message } from '@/types';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

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

  // Update chat's lastMessage and atomically increment unread count for other participants
  const chatSnap = await getDoc(doc(db, 'chats', chatId));
  const chatData = chatSnap.data();
  const otherParticipants = (chatData?.participants || []).filter((p: string) => p !== senderId);

  const updates: Record<string, any> = {
    lastMessage: {
      text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  };
  otherParticipants.forEach((uid: string) => {
    updates[`unreadCount.${uid}`] = increment(1);
  });

  await updateDoc(doc(db, 'chats', chatId), updates);
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
    unreadCount: {},
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
    groupPhoto: null,
    createdBy: currentUserId,
    matchType,
    cohortYear: null,
    lastMessage: null,
    unreadCount: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return chatDoc.id;
}

// ── Upload group photo ────────────────────────────────────────────
export async function uploadGroupPhoto(
  chatId: string,
  imageUri: string
): Promise<string> {
  const blob = await uriToBlob(imageUri);
  const storageRef = ref(storage, `chat-group-photos/${chatId}/${Date.now()}.jpg`);
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);
  await updateDoc(doc(db, 'chats', chatId), { groupPhoto: downloadUrl });
  return downloadUrl;
}

// ── Remove group photo ────────────────────────────────────────────
export async function removeGroupPhoto(chatId: string): Promise<void> {
  await updateDoc(doc(db, 'chats', chatId), { groupPhoto: null });
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
    [`unreadCount.${userId}`]: 0,
  });
}

// ── Upload chat image and send as message ───────────────────────────
export async function sendImageMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  imageUri: string
): Promise<void> {
  // Upload image to Firebase Storage
  const fileName = `${Date.now()}_${senderId}.jpg`;
  const storageRef = ref(storage, `chat-images/${chatId}/${fileName}`);
  const blob = await uriToBlob(imageUri);
  await uploadBytes(storageRef, blob);
  const imageUrl = await getDownloadURL(storageRef);

  // Create image message
  const msgRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(msgRef, {
    senderId,
    senderName,
    text: '',
    type: 'image',
    imageUrl,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });

  // Update chat's lastMessage and atomically increment unread count
  const chatSnap = await getDoc(doc(db, 'chats', chatId));
  const chatData = chatSnap.data();
  const otherParticipants = (chatData?.participants || []).filter((p: string) => p !== senderId);

  const updates: Record<string, any> = {
    lastMessage: {
      text: '📷 Photo',
      senderId,
      senderName,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  };
  otherParticipants.forEach((uid: string) => {
    updates[`unreadCount.${uid}`] = increment(1);
  });

  await updateDoc(doc(db, 'chats', chatId), updates);
}

// ── Upload file and send as message ─────────────────────────────────
export async function sendFileMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  fileUri: string,
  fileName: string
): Promise<void> {
  const storageRef = ref(storage, `chat-files/${chatId}/${Date.now()}_${fileName}`);
  const blob = await uriToBlob(fileUri);
  await uploadBytes(storageRef, blob);
  const fileUrl = await getDownloadURL(storageRef);

  const msgRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(msgRef, {
    senderId,
    senderName,
    text: '',
    type: 'file',
    imageUrl: null,
    fileUrl,
    fileName,
    createdAt: serverTimestamp(),
    readBy: [senderId],
  });

  const chatSnap = await getDoc(doc(db, 'chats', chatId));
  const chatData = chatSnap.data();
  const otherParticipants = (chatData?.participants || []).filter((p: string) => p !== senderId);

  const updates: Record<string, any> = {
    lastMessage: {
      text: `📎 ${fileName}`,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  };
  otherParticipants.forEach((uid: string) => {
    updates[`unreadCount.${uid}`] = increment(1);
  });

  await updateDoc(doc(db, 'chats', chatId), updates);
}
