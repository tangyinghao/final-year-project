import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { AppNotification } from '@/types';

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const notifs: AppNotification[] = [];
    snap.forEach((d) => notifs.push({ id: d.id, ...d.data() } as AppNotification));
    callback(notifs);
  });
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  return snap.size;
}
