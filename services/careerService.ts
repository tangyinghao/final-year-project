import { db, storage } from '@/config/firebaseConfig';
import { Job, Mentorship, JobApplication, MentorshipRequest } from '@/types';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

//  Jobs 
export async function getApprovedJobs(): Promise<Job[]> {
  const q = query(
    collection(db, 'jobs'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getJob(jobId: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, 'jobs', jobId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Job) : null;
}

export async function createJob(
  postedBy: string,
  posterName: string,
  data: { title: string; company: string; description: string; location: string; tags: string[] }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'jobs'), {
    title: data.title,
    company: data.company,
    description: data.description,
    location: data.location,
    type: 'job',
    tags: data.tags,
    postedBy,
    posterName,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function uploadCV(uid: string, fileUri: string, fileName: string): Promise<string> {
  const blob = await uriToBlob(fileUri);
  const storageRef = ref(storage, `cv-uploads/${uid}/${fileName}`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function applyToJob(
  jobId: string,
  applicantId: string,
  applicantName: string,
  cvUrl: string | null = null
): Promise<void> {
  await setDoc(doc(db, 'jobs', jobId, 'applications', applicantId), {
    applicantId,
    applicantName,
    cvUrl,
    appliedAt: serverTimestamp(),
    status: 'pending',
  });
}

//  Mentorships 
export async function getApprovedMentorships(): Promise<Mentorship[]> {
  const q = query(
    collection(db, 'mentorships'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Mentorship));
}

export async function getMentorship(mentorshipId: string): Promise<Mentorship | null> {
  const snap = await getDoc(doc(db, 'mentorships', mentorshipId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Mentorship) : null;
}

export async function createMentorship(
  mentorId: string,
  mentorName: string,
  data: {
    title: string;
    company: string;
    description: string;
    expertise: string[];
    availability: string;
    location: string;
    tags: string[];
  }
): Promise<string> {
  const docRef = await addDoc(collection(db, 'mentorships'), {
    title: data.title,
    mentorId,
    mentorName,
    company: data.company,
    description: data.description,
    expertise: data.expertise,
    availability: data.availability,
    location: data.location,
    tags: data.tags,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function requestMentorship(
  mentorshipId: string,
  requesterId: string,
  requesterName: string,
  message: string | null = null
): Promise<void> {
  await setDoc(doc(db, 'mentorships', mentorshipId, 'requests', requesterId), {
    requesterId,
    requesterName,
    message,
    requestedAt: serverTimestamp(),
    status: 'pending',
  });
}

export async function hasRequestedMentorship(mentorshipId: string, requesterId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'mentorships', mentorshipId, 'requests', requesterId));
  return snap.exists();
}

//  Management 

export async function getUserJobs(uid: string): Promise<Job[]> {
  const q = query(
    collection(db, 'jobs'),
    where('postedBy', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job));
}

export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  const q = query(
    collection(db, 'jobs', jobId, 'applications'),
    orderBy('appliedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as JobApplication);
}

export async function updateJobApplicationStatus(
  jobId: string,
  applicantId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  await updateDoc(doc(db, 'jobs', jobId, 'applications', applicantId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function getUserMentorships(uid: string): Promise<Mentorship[]> {
  const q = query(
    collection(db, 'mentorships'),
    where('mentorId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Mentorship));
}

export async function getMentorshipRequests(mentorshipId: string): Promise<MentorshipRequest[]> {
  const q = query(
    collection(db, 'mentorships', mentorshipId, 'requests'),
    orderBy('requestedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as MentorshipRequest);
}

export async function updateMentorshipRequestStatus(
  mentorshipId: string,
  requesterId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  await updateDoc(doc(db, 'mentorships', mentorshipId, 'requests', requesterId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
