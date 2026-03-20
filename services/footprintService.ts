import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { FootprintCheckin, FootprintMapType } from '@/types';

export async function getCheckins(uid: string, mapType?: FootprintMapType): Promise<FootprintCheckin[]> {
  let q;
  if (mapType) {
    q = query(
      collection(db, 'users', uid, 'footprint'),
      where('mapType', '==', mapType),
      orderBy('checkedInAt', 'desc')
    );
  } else {
    q = query(
      collection(db, 'users', uid, 'footprint'),
      orderBy('checkedInAt', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FootprintCheckin);
}

export async function checkIn(
  uid: string,
  zoneId: string,
  zoneName: string,
  mapType: FootprintMapType
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'footprint', zoneId), {
    zoneId,
    zoneName,
    mapType,
    checkedInAt: serverTimestamp(),
  });
}

export async function uncheckIn(uid: string, zoneId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'footprint', zoneId));
}
