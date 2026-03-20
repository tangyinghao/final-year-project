/**
 * Seed script — populates Firebase Auth + Firestore with test data.
 *
 * Prerequisites:
 *   npm install -g firebase-tools   (if not already)
 *   firebase login                   (if not already)
 *
 * Usage:
 *   node scripts/seedFirestore.js
 *
 * What it creates:
 *   - 4 Auth users  (alice, bob, carol, admin)
 *   - 4 user docs   in  users/
 *   - 2 chats       in  chats/       (1 direct, 1 group)  with messages
 *   - 2 events      in  events/
 *   - 1 job         in  jobs/
 *   - 1 mentorship  in  mentorships/
 *   - 2 notifications in notifications/
 *
 * All test users share the password: Test1234!
 */

const admin = require('firebase-admin');
const path = require('path');

// ─── Initialise with service account key ──
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const authAdmin = admin.auth();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const PASSWORD = 'Test1234!';

const USERS = [
  {
    email: 'alice@test.com',
    displayName: 'Alice Tan',
    role: 'student',
    programme: 'Electrical & Electronic Engineering',
    graduationYear: null,
    interests: ['AI', 'Robotics', 'IoT'],
    bio: 'Year 3 EEE student passionate about embedded systems.',
    profilePhoto: 'https://i.pravatar.cc/300?u=alice-mscircle',
  },
  {
    email: 'bob@test.com',
    displayName: 'Bob Lim',
    role: 'alumni',
    programme: 'Electrical & Electronic Engineering',
    graduationYear: 2023,
    interests: ['Power Systems', 'Renewable Energy', 'Mentoring'],
    bio: 'EEE alumni working at Schneider Electric. Happy to mentor!',
    profilePhoto: 'https://i.pravatar.cc/300?u=bob-mscircle',
  },
  {
    email: 'carol@test.com',
    displayName: 'Carol Chen',
    role: 'student',
    programme: 'Computer Engineering',
    graduationYear: null,
    interests: ['AI', 'Web Development', 'Startups'],
    bio: 'Year 2 CE student interested in AI startups.',
    profilePhoto: 'https://i.pravatar.cc/300?u=carol-mscircle',
  },
  {
    email: 'admin@test.com',
    displayName: 'Admin User',
    role: 'admin',
    programme: '',
    graduationYear: null,
    interests: [],
    bio: 'System administrator.',
    profilePhoto: 'https://i.pravatar.cc/300?u=admin-mscircle',
  },
];

async function createOrGetUser(userData) {
  let uid;
  try {
    const existing = await authAdmin.getUserByEmail(userData.email);
    uid = existing.uid;
    console.log(`  Auth user exists: ${userData.email} (${uid})`);
  } catch {
    const created = await authAdmin.createUser({
      email: userData.email,
      password: PASSWORD,
      displayName: userData.displayName,
    });
    uid = created.uid;
    console.log(`  Auth user created: ${userData.email} (${uid})`);
  }
  return uid;
}

async function deleteCollection(collectionPath, subcollections = []) {
  const colRef = db.collection(collectionPath);
  const snapshot = await colRef.get();
  if (snapshot.empty) {
    console.log(`  ${collectionPath}: already empty`);
    return;
  }
  const batch = db.batch();
  for (const docSnap of snapshot.docs) {
    // Delete subcollections first
    for (const sub of subcollections) {
      const subSnap = await docSnap.ref.collection(sub).get();
      subSnap.docs.forEach((subDoc) => batch.delete(subDoc.ref));
    }
    batch.delete(docSnap.ref);
  }
  await batch.commit();
  console.log(`  ${collectionPath}: deleted ${snapshot.size} docs`);
}

async function deleteAuthUsers() {
  for (const u of USERS) {
    try {
      const existing = await authAdmin.getUserByEmail(u.email);
      await authAdmin.deleteUser(existing.uid);
      console.log(`  Auth user deleted: ${u.email}`);
    } catch {
      // User doesn't exist, skip
    }
  }
}

async function seed() {
  console.log('\n=== Seeding Firebase ===\n');

  // ── 0. Clean slate — delete existing data ───────────────────────
  console.log('0. Cleaning existing data...');
  await deleteCollection('notifications');
  await deleteCollection('mentorships');
  await deleteCollection('jobs');
  await deleteCollection('events');
  await deleteCollection('chats', ['messages']);
  await deleteCollection('users');
  await deleteAuthUsers();
  console.log('  Clean slate ready!\n');

  // ── 1. Create Auth users & Firestore user docs ────────────────────
  console.log('1. Creating users...');
  const uids = {};
  for (const u of USERS) {
    const uid = await createOrGetUser(u);
    uids[u.email] = uid;

    await db.collection('users').doc(uid).set(
      {
        uid,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        profilePhoto: u.profilePhoto,
        programme: u.programme,
        graduationYear: u.graduationYear,
        interests: u.interests,
        bio: u.bio,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  Firestore doc set: users/${uid}`);
  }

  const aliceUid = uids['alice@test.com'];
  const bobUid = uids['bob@test.com'];
  const carolUid = uids['carol@test.com'];
  const adminUid = uids['admin@test.com'];

  // ── 2. Create a direct chat (Alice <-> Bob) ───────────────────────
  console.log('\n2. Creating chats...');

  const directChatRef = db.collection('chats').doc();
  await directChatRef.set({
    type: 'direct',
    participants: [aliceUid, bobUid],
    name: null,
    createdBy: aliceUid,
    matchType: 'manual',
    cohortYear: null,
    lastMessage: {
      text: 'Sure, happy to help with your FYP!',
      senderId: bobUid,
      senderName: 'Bob Lim',
      timestamp: FieldValue.serverTimestamp(),
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Direct chat created: ${directChatRef.id}`);

  // Add messages to direct chat
  const directMsgs = [
    { senderId: aliceUid, senderName: 'Alice Tan', text: 'Hi Bob! I saw you work at Schneider Electric. Could you share some advice on my FYP project?', type: 'text' },
    { senderId: bobUid, senderName: 'Bob Lim', text: 'Hey Alice! Of course, what is your FYP about?', type: 'text' },
    { senderId: aliceUid, senderName: 'Alice Tan', text: "I'm working on an IoT-based energy monitoring system for smart buildings.", type: 'text' },
    { senderId: bobUid, senderName: 'Bob Lim', text: "That's a great topic! We actually work on similar systems at Schneider.", type: 'text' },
    { senderId: aliceUid, senderName: 'Alice Tan', text: 'Would you be willing to be my external advisor?', type: 'text' },
    { senderId: bobUid, senderName: 'Bob Lim', text: 'Sure, happy to help with your FYP!', type: 'text' },
  ];

  for (const msg of directMsgs) {
    await directChatRef.collection('messages').add({
      ...msg,
      imageUrl: null,
      readBy: [msg.senderId],
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`  Added ${directMsgs.length} messages to direct chat`);

  // Create a group chat (Alice, Bob, Carol)
  const groupChatRef = db.collection('chats').doc();
  await groupChatRef.set({
    type: 'group',
    participants: [aliceUid, bobUid, carolUid],
    name: 'EEE Study Group',
    createdBy: carolUid,
    matchType: 'manual',
    cohortYear: null,
    lastMessage: {
      text: 'See you all at the library tomorrow!',
      senderId: carolUid,
      senderName: 'Carol Chen',
      timestamp: FieldValue.serverTimestamp(),
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Group chat created: ${groupChatRef.id}`);

  const groupMsgs = [
    { senderId: carolUid, senderName: 'Carol Chen', text: 'Hey everyone! Want to study together for the Digital Systems exam?', type: 'text' },
    { senderId: aliceUid, senderName: 'Alice Tan', text: 'Yes! I need help with Chapter 5.', type: 'text' },
    { senderId: bobUid, senderName: 'Bob Lim', text: "I can help review, I aced that module back in the day", type: 'text' },
    { senderId: carolUid, senderName: 'Carol Chen', text: 'See you all at the library tomorrow!', type: 'text' },
  ];

  for (const msg of groupMsgs) {
    await groupChatRef.collection('messages').add({
      ...msg,
      imageUrl: null,
      readBy: [msg.senderId],
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`  Added ${groupMsgs.length} messages to group chat`);

  // ── 3. Create events ──────────────────────────────────────────────
  console.log('\n3. Creating events...');

  // Official events with banner images (for carousel testing)
  const event1Ref = db.collection('events').doc();
  await event1Ref.set({
    title: 'EEE Industry Night 2026',
    description: 'Annual networking event connecting EEE students with industry professionals. Guest speakers from Dyson, ST Engineering, and more.',
    type: 'official',
    status: 'approved',
    date: new Date('2026-04-15T18:00:00'),
    location: 'LT1, NTU North Spine',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    maxCapacity: 200,
    createdBy: adminUid,
    creatorName: 'Admin User',
    attendees: [aliceUid, carolUid],
    attendeeCount: 2,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Event created: EEE Industry Night 2026 (official, with banner)`);

  const event3Ref = db.collection('events').doc();
  await event3Ref.set({
    title: 'NTU EEE Career Fair 2026',
    description: 'Meet top employers recruiting EEE graduates. Companies include Intel, Micron, TSMC, and Infineon. Bring your resume!',
    type: 'official',
    status: 'approved',
    date: new Date('2026-05-10T10:00:00'),
    location: 'NTU Convention Centre',
    coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop',
    maxCapacity: 500,
    createdBy: adminUid,
    creatorName: 'Admin User',
    attendees: [aliceUid, bobUid],
    attendeeCount: 2,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Event created: NTU EEE Career Fair 2026 (official, with banner)`);

  // User-created event
  const event2Ref = db.collection('events').doc();
  await event2Ref.set({
    title: 'Arduino Workshop for Beginners',
    description: 'Hands-on workshop to build your first IoT project with Arduino. All materials provided!',
    type: 'user-created',
    status: 'approved',
    date: new Date('2026-04-20T14:00:00'),
    location: 'Hardware Lab 2, S2-B4a',
    coverImage: null,
    maxCapacity: 30,
    createdBy: aliceUid,
    creatorName: 'Alice Tan',
    attendees: [bobUid, carolUid],
    attendeeCount: 2,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Event created: Arduino Workshop for Beginners (user-created)`);

  const event4Ref = db.collection('events').doc();
  await event4Ref.set({
    title: 'Python for Signal Processing',
    description: 'Learn how to use Python and NumPy/SciPy for EEE signal processing tasks. Covers FFT, filtering, and spectral analysis with hands-on exercises.',
    type: 'user-created',
    status: 'approved',
    date: new Date('2026-05-01T10:00:00'),
    location: 'Computer Lab 3, N4-B2c',
    coverImage: null,
    maxCapacity: 40,
    createdBy: carolUid,
    creatorName: 'Carol Chen',
    attendees: [aliceUid, bobUid, carolUid],
    attendeeCount: 3,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Event created: Python for Signal Processing (user-created)`);

  const event5Ref = db.collection('events').doc();
  await event5Ref.set({
    title: 'Resume Review & Mock Interview',
    description: 'Alumni-led session to review your resume and practice technical interviews. Bring a printed copy of your CV!',
    type: 'user-created',
    status: 'approved',
    date: new Date('2026-05-05T15:00:00'),
    location: 'Seminar Room 1, S1-B1a',
    coverImage: null,
    maxCapacity: 20,
    createdBy: bobUid,
    creatorName: 'Bob Lim',
    attendees: [aliceUid, bobUid, carolUid, adminUid],
    attendeeCount: 4,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Event created: Resume Review & Mock Interview (user-created)`);

  // ── 4. Create a job listing ───────────────────────────────────────
  console.log('\n4. Creating job listing...');

  const jobRef = db.collection('jobs').doc();
  await jobRef.set({
    title: 'Graduate Embedded Systems Engineer',
    company: 'Schneider Electric',
    description: 'Join our team to develop next-gen IoT solutions for smart buildings. Looking for fresh graduates with embedded C/C++ experience.',
    location: 'Singapore',
    type: 'job',
    tags: ['Embedded Systems', 'IoT', 'C/C++', 'Fresh Graduate'],
    postedBy: bobUid,
    posterName: 'Bob Lim',
    status: 'approved',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Job created: Graduate Embedded Systems Engineer`);

  // ── 5. Create a mentorship listing ────────────────────────────────
  console.log('\n5. Creating mentorship listing...');

  const mentorRef = db.collection('mentorships').doc();
  await mentorRef.set({
    title: 'Power Systems & Renewable Energy Mentor',
    mentorId: bobUid,
    mentorName: 'Bob Lim',
    company: 'Schneider Electric',
    description: 'I can mentor students interested in power systems, renewable energy, or transitioning from uni to industry.',
    expertise: ['Power Systems', 'Renewable Energy', 'Career Advice'],
    availability: 'Weekends, 2 hours/week',
    location: 'Singapore / Online',
    tags: ['Power Systems', 'Renewable Energy', 'Mentoring'],
    status: 'approved',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  console.log(`  Mentorship created: Power Systems & Renewable Energy Mentor`);

  // ── 6. Create notifications ───────────────────────────────────────
  console.log('\n6. Creating notifications...');

  await db.collection('notifications').add({
    userId: aliceUid,
    type: 'event',
    title: 'New Event: EEE Industry Night 2026',
    body: 'Don\'t miss the annual networking event on April 15!',
    data: { route: `/events/${event1Ref.id}` },
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  await db.collection('notifications').add({
    userId: aliceUid,
    type: 'message',
    title: 'New message from Bob Lim',
    body: 'Sure, happy to help with your FYP!',
    data: { route: `/chat/${directChatRef.id}?name=${encodeURIComponent('Bob Lim')}&avatar=${encodeURIComponent(`https://i.pravatar.cc/150?u=${bobUid}`)}` },
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log('  2 notifications created for Alice');

  // ── Done ──────────────────────────────────────────────────────────
  console.log('\n=== Seed complete! ===');
  console.log('\nTest accounts (password for all: Test1234!):');
  console.log(`  alice@test.com  (student)  — uid: ${aliceUid}`);
  console.log(`  bob@test.com    (alumni)   — uid: ${bobUid}`);
  console.log(`  carol@test.com  (student)  — uid: ${carolUid}`);
  console.log(`  admin@test.com  (admin)    — uid: ${adminUid}`);
  console.log('');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
