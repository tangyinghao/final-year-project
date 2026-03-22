import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
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
import { AppEvent } from '@/types';

// ── Get approved official events (for carousel) ──────────────────────
export async function getApprovedOfficialEvents(): Promise<AppEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('type', '==', 'official'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppEvent));
}

// ── Get approved user-created events (for main list) ─────────────────
export async function getApprovedUserEvents(): Promise<AppEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('type', '==', 'user-created'),
    where('status', '==', 'approved'),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppEvent));
}

// ── Get event by ID ──────────────────────────────────────────────────
export async function getEvent(eventId: string): Promise<AppEvent | null> {
  const snap = await getDoc(doc(db, 'events', eventId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AppEvent) : null;
}

// ── Create user event (always user-created + pending) ────────────────
export async function createUserEvent(
  createdBy: string,
  creatorName: string,
  data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    maxCapacity: number | null;
    coverImage?: string | null;
  }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'events'), {
    title: data.title,
    description: data.description,
    type: 'user-created',
    status: 'pending',
    date: Timestamp.fromDate(data.date),
    location: data.location,
    coverImage: data.coverImage ?? null,
    maxCapacity: data.maxCapacity,
    createdBy,
    creatorName,
    attendees: [createdBy],
    attendeeCount: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ── Join event ───────────────────────────────────────────────────────
export async function joinEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayUnion(userId),
    attendeeCount: increment(1),
    updatedAt: serverTimestamp(),
  });
}

// ── Leave event ──────────────────────────────────────────────────────
export async function leaveEvent(eventId: string, userId: string): Promise<void> {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, {
    attendees: arrayRemove(userId),
    attendeeCount: increment(-1),
    updatedAt: serverTimestamp(),
  });
}

// ── Upload event cover image ─────────────────────────────────────────
export async function uploadEventImage(eventId: string, uri: string): Promise<string> {
  const file = new ExpoFile(uri);
  const base64 = await file.base64();
  const blob = await uriToBlob(`data:image/jpeg;base64,${base64}`);
  const storageRef = ref(storage, `event-images/${eventId}.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

// ── Get user's own events (any status) ───────────────────────────────
export async function getMyEvents(userId: string): Promise<AppEvent[]> {
  const q = query(
    collection(db, 'events'),
    where('createdBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppEvent));
}
