import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { scorePair } from './smartMatchMatcher';
import { UserData } from './smartMatchTypes';

export const getDiscoveryResults = https.onCall({ cors: true }, async (request) => {
  const db = admin.firestore();
  if (!request.auth) throw new https.HttpsError('unauthenticated', 'Must be signed in');

  const callerId = request.auth.uid;
  const offset = (request.data?.offset as number) || 0;
  const limit = (request.data?.limit as number) || 10;
  const purpose = request.data?.purpose || 'mixed';

  // Fetch caller profile
  const callerSnap = await db.doc(`users/${callerId}`).get();
  if (!callerSnap.exists) throw new https.HttpsError('not-found', 'User not found');
  const callerData = callerSnap.data()!;

  const callerUser: UserData = {
    uid: callerId,
    displayName: callerData.displayName,
    role: callerData.role,
    programme: callerData.programme || '',
    graduationYear: callerData.graduationYear || null,
    interests: callerData.interests || [],
    languages: callerData.languages || [],
    matchingEnabled: callerData.matchingEnabled,
    status: callerData.status,
  };

  // Fetch all eligible users
  const usersSnap = await db.collection('users')
    .where('status', '==', 'active')
    .where('matchingEnabled', '==', true)
    .get();

  const scored: Array<{
    userId: string;
    displayName: string;
    profilePhoto: string | null;
    programme: string;
    role: string;
    score: number;
    reasons: string[];
  }> = [];

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (data.uid === callerId) continue;
    if (data.role === 'admin') continue;

    const otherUser: UserData = {
      uid: data.uid,
      displayName: data.displayName,
      role: data.role,
      programme: data.programme || '',
      graduationYear: data.graduationYear || null,
      interests: data.interests || [],
      languages: data.languages || [],
      matchingEnabled: data.matchingEnabled,
      status: data.status,
    };

    const pair = scorePair(callerUser, otherUser, purpose);
    scored.push({
      userId: data.uid,
      displayName: data.displayName,
      profilePhoto: data.profilePhoto || null,
      programme: data.programme || '',
      role: data.role,
      score: pair.score,
      reasons: pair.reasons,
    });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Paginate
  const page = scored.slice(offset, offset + limit);

  return { results: page, total: scored.length };
});
