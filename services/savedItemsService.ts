import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { SavedItem } from '@/types';

function savedItemsRef(uid: string) {
  return collection(db, 'users', uid, 'savedItems');
}

export async function getSavedItems(uid: string): Promise<SavedItem[]> {
  const snap = await getDocs(savedItemsRef(uid));
  return snap.docs.map((d) => d.data() as SavedItem);
}

export async function isSaved(uid: string, itemId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid, 'savedItems', itemId));
  return snap.exists();
}

export async function saveItem(
  uid: string,
  itemId: string,
  itemType: 'job' | 'mentorship'
): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'savedItems', itemId), {
    itemId,
    itemType,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'savedItems', itemId));
}

export async function toggleSaveItem(
  uid: string,
  itemId: string,
  itemType: 'job' | 'mentorship'
): Promise<boolean> {
  const exists = await isSaved(uid, itemId);
  if (exists) {
    await unsaveItem(uid, itemId);
    return false;
  } else {
    await saveItem(uid, itemId, itemType);
    return true;
  }
}
