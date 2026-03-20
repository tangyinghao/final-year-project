import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { File as ExpoFile } from 'expo-file-system';

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Failed to create blob'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}
import { db, storage } from '@/config/firebaseConfig';
import { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'programme' | 'graduationYear' | 'interests' | 'profilePhoto'>>
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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
  // Firestore doesn't support full-text search, so we fetch active users and filter client-side
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    orderBy('displayName'),
    limit(50)
  );
  const snap = await getDocs(q);
  const results: UserProfile[] = [];
  const lower = searchText.toLowerCase();
  snap.forEach((d) => {
    const u = d.data() as UserProfile;
    if (u.uid !== currentUid && u.displayName.toLowerCase().includes(lower)) {
      results.push(u);
    }
  });
  return results;
}

export async function getAllActiveUsers(currentUid: string): Promise<UserProfile[]> {
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    limit(100)
  );
  const snap = await getDocs(q);
  const results: UserProfile[] = [];
  snap.forEach((d) => {
    const u = d.data() as UserProfile;
    if (u.uid !== currentUid) results.push(u);
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
