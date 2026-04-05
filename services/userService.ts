import { db, storage } from '@/config/firebaseConfig';
import { UserProfile } from '@/types';
import { File as ExpoFile } from 'expo-file-system';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'programme' | 'graduationYear' | 'interests' | 'profilePhoto' | 'notificationsEnabled' | 'onboarded'>>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: any = { ...data, updatedAt: serverTimestamp() };
  if (data.displayName) {
    update.displayNameLower = data.displayName.toLowerCase();
  }
  await updateDoc(doc(db, 'users', uid), update);
}

export async function uploadProfilePhoto(uid: string, uri: string): Promise<string> {
  const file = new ExpoFile(uri);
  const base64 = await file.base64();
  const blob = await uriToBlob(`data:image/jpeg;base64,${base64}`);
  const storageRef = ref(storage, `profile-photos/${uid}.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function searchUsers(searchText: string, currentUid: string): Promise<UserProfile[]> {
  const lower = searchText.toLowerCase();
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    where('displayNameLower', '>=', lower),
    where('displayNameLower', '<=', lower + '\uf8ff'),
    orderBy('displayNameLower'),
    limit(20)
  );
  const snap = await getDocs(q);
  const results: UserProfile[] = [];
  snap.forEach((d) => {
    const u = d.data() as UserProfile;
    if (u.uid !== currentUid && u.role !== 'admin') results.push(u);
  });
  return results;
}

export async function getUsersByIds(uids: string[]): Promise<UserProfile[]> {
  if (uids.length === 0) return [];
  const results: UserProfile[] = [];
  // Firestore 'in' queries support max 30 items
  const batches = [];
  for (let i = 0; i < uids.length; i += 30) {
    batches.push(uids.slice(i, i + 30));
  }
  for (const batch of batches) {
    const q = query(collection(db, 'users'), where('uid', 'in', batch));
    const snap = await getDocs(q);
    snap.forEach((d) => results.push(d.data() as UserProfile));
  }
  return results;
}
