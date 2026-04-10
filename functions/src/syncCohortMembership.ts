import * as admin from 'firebase-admin';
import { firestore, logger } from 'firebase-functions/v2';

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

    logger.info(`syncCohortMembership: uid=${uid} graduationYear=${graduationYear}`);

    // Only process users with a graduation year
    if (!graduationYear) {
      logger.info(`syncCohortMembership: skipping uid=${uid}: no graduationYear`);
      return;
    }

    const cohortRef = db.collection('cohorts').doc(String(graduationYear));

    await db.runTransaction(async (tx) => {
      // ---- ALL READS FIRST ----
      const cohortSnap = await tx.get(cohortRef);

      let existingChatRef: admin.firestore.DocumentReference | null = null;
      let existingChatExists = false;
      if (cohortSnap.exists) {
        const data = cohortSnap.data()!;
        if (data.chatId) {
          existingChatRef = db.collection('chats').doc(data.chatId);
          const chatSnap = await tx.get(existingChatRef);
          existingChatExists = chatSnap.exists;
        }
      }

      // ---- ALL WRITES AFTER ----
      if (!cohortSnap.exists) {
        logger.info(`syncCohortMembership: creating new cohort ${graduationYear} for uid=${uid}`);
        // Create cohort and cohort chat
        const chatRef = db.collection('chats').doc();
        tx.set(chatRef, {
          type: 'cohort',
          participants: [uid],
          name: `Class of ${graduationYear}`,
          createdBy: uid,
          owner: null,
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
        return;
      }

      const data = cohortSnap.data()!;
      const memberIds: string[] = data.memberIds || [];

      logger.info(`syncCohortMembership: cohort ${graduationYear} exists, adding uid=${uid}`);

      if (!memberIds.includes(uid)) {
        tx.update(cohortRef, {
          memberIds: admin.firestore.FieldValue.arrayUnion(uid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      if (existingChatRef && existingChatExists) {
        // Chat exists: add the user to its participants
        tx.update(existingChatRef, {
          participants: admin.firestore.FieldValue.arrayUnion(uid),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Chat missing or no chatId: (re)create it
        const newChatRef = db.collection('chats').doc();
        tx.set(newChatRef, {
          type: 'cohort',
          participants: [...memberIds, uid].filter((v, i, a) => a.indexOf(v) === i),
          name: `Class of ${graduationYear}`,
          createdBy: uid,
          owner: null,
          matchType: 'manual',
          cohortYear: graduationYear,
          lastMessage: null,
          unreadCount: {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.update(cohortRef, {
          chatId: newChatRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  }
);
