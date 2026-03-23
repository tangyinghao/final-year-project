/**
 * Diagnostic script — checks cohort documents and their linked chats.
 * Usage: node scripts/diagnoseCohorts.js
 */
const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'functions', 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

async function diagnose() {
  // 1. List all cohort documents
  console.log('=== COHORT DOCUMENTS ===');
  const cohortsSnap = await db.collection('cohorts').get();
  if (cohortsSnap.empty) {
    console.log('  (none found)');
  }
  for (const doc of cohortsSnap.docs) {
    const data = doc.data();
    console.log(`\n  cohorts/${doc.id}`);
    console.log(`    year: ${data.year}`);
    console.log(`    memberIds (${(data.memberIds || []).length}): ${(data.memberIds || []).join(', ')}`);
    console.log(`    chatId: ${data.chatId || '(null/missing)'}`);

    // Check if the linked chat actually exists
    if (data.chatId) {
      const chatDoc = await db.collection('chats').doc(data.chatId).get();
      if (chatDoc.exists) {
        const chat = chatDoc.data();
        console.log(`    ✓ Linked chat EXISTS — participants (${(chat.participants || []).length}): ${(chat.participants || []).join(', ')}`);
        console.log(`      chat.name: ${chat.name}`);
        console.log(`      chat.type: ${chat.type}`);
        console.log(`      chat.cohortYear: ${chat.cohortYear}`);
      } else {
        console.log(`    ✗ Linked chat DOES NOT EXIST — chatId is stale!`);
      }
    }
  }

  // 2. Find ALL cohort-type chats (to detect orphans)
  console.log('\n\n=== ALL COHORT-TYPE CHATS ===');
  const cohortChatsSnap = await db.collection('chats').where('type', '==', 'cohort').get();
  if (cohortChatsSnap.empty) {
    console.log('  (none found)');
  }
  for (const doc of cohortChatsSnap.docs) {
    const data = doc.data();
    // Check if any cohort doc references this chat
    const referencedBy = cohortsSnap.docs.find(c => c.data().chatId === doc.id);
    const status = referencedBy ? `referenced by cohorts/${referencedBy.id}` : 'ORPHAN — not referenced by any cohort doc';
    console.log(`\n  chats/${doc.id}`);
    console.log(`    name: ${data.name}`);
    console.log(`    cohortYear: ${data.cohortYear}`);
    console.log(`    participants (${(data.participants || []).length}): ${(data.participants || []).join(', ')}`);
    console.log(`    status: ${status}`);
  }

  // 3. Check users with graduationYear
  console.log('\n\n=== USERS WITH GRADUATION YEAR ===');
  const usersSnap = await db.collection('users').get();
  const usersWithYear = [];
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (data.graduationYear) {
      usersWithYear.push({ uid: doc.id, name: data.displayName, year: data.graduationYear });
    }
  }
  usersWithYear.sort((a, b) => a.year - b.year);
  for (const u of usersWithYear) {
    console.log(`  ${u.name} (${u.uid}) — graduationYear: ${u.year}`);
  }

  console.log('\nDone.');
  process.exit(0);
}

diagnose().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
