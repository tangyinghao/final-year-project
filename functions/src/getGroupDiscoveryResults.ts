import { https } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { scorePair } from './smartMatchMatcher';
import { UserData } from './smartMatchTypes';

export const getGroupDiscoveryResults = https.onCall({ cors: true }, async (request) => {
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

  // Fetch all listed groups
  const groupsSnap = await db.collection('chats')
    .where('type', '==', 'group')
    .where('listed', '==', true)
    .get();

  const scored: Array<{
    chatId: string;
    name: string;
    purpose: string | null;
    tags: string[];
    memberCount: number;
    maxCapacity: number | null;
    ownerName: string;
    score: number;
    reasons: string[];
    members: Array<{
      uid: string;
      displayName: string;
      profilePhoto: string | null;
    }>;
    memberPhotos: (string | null)[];
    memberNames: string[];
  }> = [];

  const getReasonKey = (reason: string) => {
    const normalized = reason.trim().toLowerCase();
    if (normalized.startsWith('shared interests:')) return 'shared interests';
    if (normalized.startsWith('same programme:')) return 'same programme';
    if (normalized.startsWith('shared language:')) return 'shared language';
    return normalized;
  };

  for (const groupDoc of groupsSnap.docs) {
    const groupData = groupDoc.data();
    // Skip groups user is already in
    if ((groupData.participants || []).includes(callerId)) continue;
    // Skip full groups
    if (groupData.maxCapacity && groupData.participants.length >= groupData.maxCapacity) continue;

    // Fetch member profiles and score against caller
    const memberIds: string[] = groupData.participants || [];
    const memberSnaps = await Promise.all(
      memberIds.slice(0, 10).map((uid: string) => db.doc(`users/${uid}`).get())
    );

    let totalScore = 0;
    let scoreCount = 0;
    const allReasons: string[] = [];
    const reasonKeys = new Set<string>();
    const members: Array<{
      uid: string;
      displayName: string;
      profilePhoto: string | null;
    }> = [];
    const memberPhotos: (string | null)[] = [];
    const memberNames: string[] = [];
    let ownerName = '';

    for (const mSnap of memberSnaps) {
      if (!mSnap.exists) continue;
      const mData = mSnap.data()!;

      if (mData.uid === groupData.owner) {
        ownerName = mData.displayName;
      }
      members.push({
        uid: mData.uid,
        displayName: mData.displayName || 'Member',
        profilePhoto: mData.profilePhoto || null,
      });
      memberPhotos.push(mData.profilePhoto || null);
      memberNames.push(mData.displayName || '');

      const memberUser: UserData = {
        uid: mData.uid,
        displayName: mData.displayName,
        role: mData.role,
        programme: mData.programme || '',
        graduationYear: mData.graduationYear || null,
        interests: mData.interests || [],
        languages: mData.languages || [],
        matchingEnabled: mData.matchingEnabled,
        status: mData.status,
      };

      const pair = scorePair(callerUser, memberUser, purpose);
      totalScore += pair.score;
      scoreCount++;
      for (const r of pair.reasons) {
        const key = getReasonKey(r);
        if (!reasonKeys.has(key) && allReasons.length < 5) {
          reasonKeys.add(key);
          allReasons.push(r);
        }
      }
    }

    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    scored.push({
      chatId: groupDoc.id,
      name: groupData.name || 'Group Chat',
      purpose: groupData.purpose || null,
      tags: groupData.tags || [],
      memberCount: memberIds.length,
      maxCapacity: groupData.maxCapacity || null,
      ownerName,
      score: avgScore,
      reasons: allReasons,
      members,
      memberPhotos,
      memberNames,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  const page = scored.slice(offset, offset + limit);

  return { results: page, total: scored.length };
});
