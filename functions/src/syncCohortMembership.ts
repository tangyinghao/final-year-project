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
        const data = cohortSnap.data()!;
        const memberIds: string[] = data.memberIds || [];

        if (!memberIds.includes(uid)) {
          tx.update(cohortRef, {
            memberIds: admin.firestore.FieldValue.arrayUnion(uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        // Keep cohort chat participants in sync — recreate if missing
        if (data.chatId) {
          const chatRef = db.collection('chats').doc(data.chatId);
          const chatSnap = await tx.get(chatRef);
          if (chatSnap.exists) {
            tx.update(chatRef, {
              participants: admin.firestore.FieldValue.arrayUnion(uid),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            // Chat was deleted or lost — recreate it
            const newChatRef = db.collection('chats').doc();
            tx.set(newChatRef, {
              type: 'cohort',
              participants: [...memberIds, uid].filter((v, i, a) => a.indexOf(v) === i),
              name: `Class of ${graduationYear}`,
              createdBy: uid,
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
        } else {
          // No chatId at all — create the chat
          const newChatRef = db.collection('chats').doc();
          tx.set(newChatRef, {
            type: 'cohort',
            participants: [...memberIds, uid].filter((v, i, a) => a.indexOf(v) === i),
            name: `Class of ${graduationYear}`,
            createdBy: uid,
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
      }
    });
  }
);
