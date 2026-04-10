import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

//  Callable function helpers 
export const callGetDashboardStats = httpsCallable(functions, 'getDashboardStats');
export const callGetPendingContent = httpsCallable(functions, 'getPendingContent');
export const callApproveContent = httpsCallable(functions, 'approveContent');
export const callGetReports = httpsCallable(functions, 'getReports');
export const callUpdateReportStatus = httpsCallable(functions, 'updateReportStatus');
export const callGetUsers = httpsCallable(functions, 'getUsers');
export const callSuspendUser = httpsCallable(functions, 'suspendUser');
export const callCreateOfficialEvent = httpsCallable(functions, 'createOfficialEvent');
export const callEditEvent = httpsCallable(functions, 'editEvent');
export const callDeleteEvent = httpsCallable(functions, 'deleteEvent');
