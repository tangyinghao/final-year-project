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
  DiscoveryResult,
  GroupDiscoveryResult,
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


export async function joinGroup(chatId: string): Promise<string> {
  const fn = httpsCallable(functions, 'joinGroup');
  const result = await fn({ chatId });
  return (result.data as { chatId: string }).chatId;
}

export async function leaveGroup(chatId: string, targetUserId?: string): Promise<void> {
  const fn = httpsCallable(functions, 'leaveGroup');
  await fn({ chatId, targetUserId });
}

