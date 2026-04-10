import { db } from '@/config/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ChatRequest,
  DiscoveryResult,
  GroupDiscoveryResult,
  GroupJoinRequest,
} from '@/types';

const functions = getFunctions();

export async function getPersonDiscovery(
  offset: number,
  limit: number,
  purpose = 'mixed'
): Promise<{ results: DiscoveryResult[]; total: number }> {
  const fn = httpsCallable(functions, 'getDiscoveryResults');
  const result = await fn({ offset, limit, purpose });
  return result.data as { results: DiscoveryResult[]; total: number };
}

export async function getGroupDiscovery(
  offset: number,
  limit: number,
  purpose = 'mixed'
): Promise<{ results: GroupDiscoveryResult[]; total: number }> {
  const fn = httpsCallable(functions, 'getGroupDiscoveryResults');
  const result = await fn({ offset, limit, purpose });
  return result.data as { results: GroupDiscoveryResult[]; total: number };
}

export async function sendChatRequest(
  recipientId: string,
  introNote?: string
): Promise<string> {
  const fn = httpsCallable(functions, 'sendChatRequest');
  const result = await fn({ recipientId, introNote: introNote || null });
  return (result.data as { requestId: string }).requestId;
}

export async function respondToChatRequest(
  requestId: string,
  action: 'accept' | 'decline' | 'cancel'
): Promise<string | null> {
  const fn = httpsCallable(functions, 'respondChatRequest');
  const result = await fn({ requestId, action });
  const data = result.data as { status: string; chatId?: string };
  return data.chatId || null;
}

export async function sendGroupJoinRequest(chatId: string): Promise<string> {
  const fn = httpsCallable(functions, 'sendGroupJoinRequest');
  const result = await fn({ chatId });
  return (result.data as { requestId: string }).requestId;
}

export async function respondToGroupJoinRequest(
  requestId: string,
  action: 'approve' | 'decline' | 'cancel'
): Promise<void> {
  const fn = httpsCallable(functions, 'respondGroupJoinRequest');
  await fn({ requestId, action });
}

export async function joinGroup(chatId: string): Promise<string> {
  const fn = httpsCallable(functions, 'joinGroup');
  const result = await fn({ chatId });
  return (result.data as { chatId: string }).chatId;
}

export async function leaveGroup(chatId: string, targetUserId?: string): Promise<void> {
  const fn = httpsCallable(functions, 'leaveGroup');
  await fn({ chatId, targetUserId });
}

export function subscribeToMyInboundRequests(
  userId: string,
  callback: (requests: ChatRequest[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chatRequests'),
    where('recipientId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatRequest));
    callback(requests);
  });
}

export function subscribeToMyOutboundRequests(
  userId: string,
  callback: (requests: ChatRequest[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'chatRequests'),
    where('senderId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatRequest));
    callback(requests);
  });
}

export function subscribeToGroupJoinRequests(
  chatId: string,
  callback: (requests: GroupJoinRequest[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'groupJoinRequests'),
    where('chatId', '==', chatId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GroupJoinRequest));
    callback(requests);
  });
}
