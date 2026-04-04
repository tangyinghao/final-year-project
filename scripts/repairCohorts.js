/**
 * Repair script fixes cohorts with missing/stale chat documents
 * and ensures all users with a graduationYear are in their cohort.
 *
 * How to use: node scripts/repairCohorts.js
 */
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'functions', 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function repair() {
  // 1. Build map of graduationYear -> user UIDs
  const usersSnap = await db.collection('users').get();
  const yearToUids = {};
  for (const doc of usersSnap.docs) {
    const year = doc.data().graduationYear;
    if (year) {
      if (!yearToUids[year]) yearToUids[year] = [];
      yearToUids[year].push(doc.id);
    }
  }

  console.log('Users by graduation year:');
  for (const [year, uids] of Object.entries(yearToUids)) {
    console.log(`  ${year}: ${uids.length} users`);
  }

  // 2. For each year, ensure cohort doc + chat exist and are correct
  for (const [year, uids] of Object.entries(yearToUids)) {
    const cohortRef = db.collection('cohorts').doc(String(year));
    const cohortSnap = await cohortRef.get();

    if (!cohortSnap.exists) {
      // Create cohort + chat from scratch
      console.log(`\n[${year}] No cohort doc — creating cohort + chat`);
      const chatRef = db.collection('chats').doc();
      await chatRef.set({
        type: 'cohort',
        participants: uids,
        name: `Class of ${year}`,
        createdBy: uids[0],
        matchType: 'manual',
        cohortYear: Number(year),
        lastMessage: null,
        unreadCount: {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await cohortRef.set({
        year: Number(year),
        memberIds: uids,
        chatId: chatRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✓ Created cohort + chat (${chatRef.id}) with ${uids.length} members`);
      continue;
    }

    const data = cohortSnap.data();
    let chatId = data.chatId;
    let chatExists = false;

    if (chatId) {
      const chatSnap = await db.collection('chats').doc(chatId).get();
      chatExists = chatSnap.exists;
    }

    if (!chatExists) {
      // Chat is missing or stale — recreate
      console.log(`\n[${year}] Chat missing (chatId: ${chatId || 'null'}) — recreating`);
      const newChatRef = db.collection('chats').doc();
      await newChatRef.set({
        type: 'cohort',
        participants: uids,
        name: `Class of ${year}`,
        createdBy: uids[0],
        matchType: 'manual',
        cohortYear: Number(year),
        lastMessage: null,
        unreadCount: {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      await cohortRef.update({
        memberIds: uids,
        chatId: newChatRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✓ Created new chat (${newChatRef.id}) with ${uids.length} members`);
    } else {
      // Chat exists — ensure all users are in memberIds + participants
      console.log(`\n[${year}] Chat exists (${chatId}) — syncing members`);
      const currentMembers = data.memberIds || [];
      const missingFromCohort = uids.filter(uid => !currentMembers.includes(uid));

      if (missingFromCohort.length > 0) {
        await cohortRef.update({
          memberIds: admin.firestore.FieldValue.arrayUnion(...uids),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`  ✓ Added ${missingFromCohort.length} missing members to cohort doc`);
      }

      await db.collection('chats').doc(chatId).update({
        participants: admin.firestore.FieldValue.arrayUnion(...uids),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✓ Synced chat participants (${uids.length} total)`);
    }
  }

  console.log('\nRepair complete.');
  process.exit(0);
}

repair().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
