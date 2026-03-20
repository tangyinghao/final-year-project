import { firestore } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * Keeps cohort membership and cohort chat provisioning in sync.
 * Runs on any write to users/{uid}. Idempotent.
 *
 * - All users (student + alumni) with a graduationYear get added to cohorts.
 * - When a user changes their graduationYear, they are added to the new cohort
 *   but remain in their previous cohort chat (they are NOT removed).
 */
export const syncCohortMembership = firestore.onDocumentWritten(
  'users/{uid}',
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return; // deleted user, nothing to do

    const db = admin.firestore();
    const uid = event.params.uid;
    const graduationYear = after.graduationYear;

    // Only process users with a graduation year
    if (!graduationYear) return;

    const cohortRef = db.collection('cohorts').doc(String(graduationYear));

    await db.runTransaction(async (tx) => {
      const cohortSnap = await tx.get(cohortRef);

      if (!cohortSnap.exists) {
        // Create cohort and cohort chat
        const chatRef = db.collection('chats').doc();
        tx.set(chatRef, {
          type: 'cohort',
          participants: [uid],
          name: `Class of ${graduationYear}`,
          createdBy: uid,
          matchType: 'manual',
          cohortYear: graduationYear,
          lastMessage: null,
          unreadCount: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.set(cohortRef, {
          year: graduationYear,
          memberIds: [uid],
          chatId: chatRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Ensure user is in memberIds
        const data = cohortSnap.data()!;
        const memberIds: string[] = data.memberIds || [];

        if (!memberIds.includes(uid)) {
          tx.update(cohortRef, {
            memberIds: admin.firestore.FieldValue.arrayUnion(uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Keep cohort chat participants in sync
        if (data.chatId) {
          const chatRef = db.collection('chats').doc(data.chatId);
          tx.update(chatRef, {
            participants: admin.firestore.FieldValue.arrayUnion(uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    });
  }
);
