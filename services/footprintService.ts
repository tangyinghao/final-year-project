import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { FootprintCheckin } from '@/types';

export async function getCheckins(uid: string): Promise<FootprintCheckin[]> {
  const q = query(
    collection(db, 'users', uid, 'footprint'),
    orderBy('checkedInAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FootprintCheckin);
}

export async function checkIn(
  uid: string,
  zoneId: string,
  zoneName: string
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'footprint', zoneId), {
    zoneId,
    zoneName,
    checkedInAt: serverTimestamp(),
  });
}
