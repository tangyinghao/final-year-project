import { auth } from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Creates a fallback Firestore user profile when a Firebase Auth user is created.
 * Does not overwrite existing docs (client or admin tooling may write first).
 */
export const onUserCreate = auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  const db = admin.firestore();
  const userRef = db.collection('users').doc(user.uid);
  const snap = await userRef.get();

  if (snap.exists) return; // client already created the doc during registration

  await userRef.set({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    displayNameLower: (user.displayName || '').toLowerCase(),
    role: 'student',
    profilePhoto: null,
    programme: '',
    graduationYear: null,
    interests: [],
    bio: '',
    status: 'active',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
