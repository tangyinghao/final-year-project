/**
 * Seed script — populates Firebase Auth + Firestore with test data.
 *
 * Prerequisites:
 *   npm install -g firebase-tools
 *   npm install firebase-admin --save-dev
 *   firebase login
 *
 * Usage:
 *   node scripts/seedFirestore.js
 *
 * What it creates:
 *   - 22 Auth users  (2 admins, 20 students/alumni)
 *   - 22 user docs   in  users/
 *   - 2 group chats  in  chats/   with messages
 *   - 10 direct chats per user    with messages
 *   - 4 official events  in events/
 *   - 10 user-created events in events/
 *   - 10 jobs in jobs/
 *   - 10 mentorships in mentorships/
 *
 * All test users share the password: Test1234!
 */

const admin = require('firebase-admin');
const path = require('path');

// ─── Initialise with service account key ──
const serviceAccount = require(path.join(__dirname, '..', 'functions', 'serviceAccountKey.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const authAdmin = admin.auth();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const PASSWORD = 'Test1234!';

// Users
const USERS = [
  // Admins
  { email: 'admin1@test.com', displayName: 'Dr. Sarah Wong', role: 'admin', programme: '', graduationYear: null, interests: [], bio: 'MSCircle system administrator and EEE faculty.', profilePhoto: 'https://i.pravatar.cc/300?u=admin1-mscircle' },
  { email: 'admin2@test.com', displayName: 'James Ong', role: 'admin', programme: '', graduationYear: null, interests: [], bio: 'Student affairs coordinator and platform admin.', profilePhoto: 'https://i.pravatar.cc/300?u=admin2-mscircle' },
  // Students
  { email: 'alice@test.com', displayName: 'Alice Tan', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['AI', 'Robotics', 'IoT'], bio: 'Year 3 EEE student passionate about embedded systems.', profilePhoto: 'https://i.pravatar.cc/300?u=alice-mscircle' },
  { email: 'bob@test.com', displayName: 'Bob Lim', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2023, interests: ['Power Systems', 'Renewable Energy', 'Mentoring'], bio: 'EEE alumni working at Schneider Electric. Happy to mentor!', profilePhoto: 'https://i.pravatar.cc/300?u=bob-mscircle' },
  { email: 'carol@test.com', displayName: 'Carol Chen', role: 'student', programme: 'Computer Engineering', graduationYear: null, interests: ['AI', 'Web Development', 'Startups'], bio: 'Year 2 CE student interested in AI startups.', profilePhoto: 'https://i.pravatar.cc/300?u=carol-mscircle' },
  { email: 'david@test.com', displayName: 'David Ng', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2022, interests: ['Signal Processing', 'Communications', '5G'], bio: 'RF engineer at Qualcomm Singapore.', profilePhoto: 'https://i.pravatar.cc/300?u=david-mscircle' },
  { email: 'emily@test.com', displayName: 'Emily Koh', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Electronics', 'VLSI', 'Semiconductors'], bio: 'Year 3 student specialising in VLSI design.', profilePhoto: 'https://i.pravatar.cc/300?u=emily-mscircle' },
  { email: 'frank@test.com', displayName: 'Frank Lee', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2021, interests: ['Power Engineering', 'Smart Grid', 'EVs'], bio: 'Power systems engineer at SP Group.', profilePhoto: 'https://i.pravatar.cc/300?u=frank-mscircle' },
  { email: 'grace@test.com', displayName: 'Grace Yeo', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Computer Control', 'Automation', 'PLC'], bio: 'Year 2 student interested in industrial automation.', profilePhoto: 'https://i.pravatar.cc/300?u=grace-mscircle' },
  { email: 'henry@test.com', displayName: 'Henry Chua', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2020, interests: ['Communications', 'Networking', 'IoT'], bio: 'Network architect at Singtel.', profilePhoto: 'https://i.pravatar.cc/300?u=henry-mscircle' },
  { email: 'iris@test.com', displayName: 'Iris Teo', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Signal Processing', 'Machine Learning', 'Audio'], bio: 'Year 3 student researching audio ML.', profilePhoto: 'https://i.pravatar.cc/300?u=iris-mscircle' },
  { email: 'jack@test.com', displayName: 'Jack Sim', role: 'alumni', programme: 'Computer Engineering', graduationYear: 2023, interests: ['Embedded Systems', 'FPGA', 'Hardware'], bio: 'Hardware engineer at Dyson Singapore.', profilePhoto: 'https://i.pravatar.cc/300?u=jack-mscircle' },
  { email: 'karen@test.com', displayName: 'Karen Loh', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Power Engineering', 'Renewable Energy', 'Solar'], bio: 'Year 2 student interested in solar energy systems.', profilePhoto: 'https://i.pravatar.cc/300?u=karen-mscircle' },
  { email: 'lucas@test.com', displayName: 'Lucas Pang', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2022, interests: ['Electronics', 'PCB Design', 'IoT'], bio: 'Electronics design engineer at Keysight.', profilePhoto: 'https://i.pravatar.cc/300?u=lucas-mscircle' },
  { email: 'megan@test.com', displayName: 'Megan Foo', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['AI', 'Computer Vision', 'Robotics'], bio: 'Year 3 student working on autonomous drones.', profilePhoto: 'https://i.pravatar.cc/300?u=megan-mscircle' },
  { email: 'nathan@test.com', displayName: 'Nathan Ho', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2021, interests: ['Communications', '5G', 'Antenna Design'], bio: 'Antenna engineer at Ericsson.', profilePhoto: 'https://i.pravatar.cc/300?u=nathan-mscircle' },
  { email: 'olivia@test.com', displayName: 'Olivia Kwek', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Computer Control', 'Robotics', 'ROS'], bio: 'Year 2 student building ROS-based robots.', profilePhoto: 'https://i.pravatar.cc/300?u=olivia-mscircle' },
  { email: 'peter@test.com', displayName: 'Peter Goh', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2020, interests: ['Signal Processing', 'Radar', 'Defence'], bio: 'DSP engineer at ST Engineering.', profilePhoto: 'https://i.pravatar.cc/300?u=peter-mscircle' },
  { email: 'rachel@test.com', displayName: 'Rachel Tay', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['Electronics', 'Biomedical', 'Sensors'], bio: 'Year 3 student researching biomedical sensors.', profilePhoto: 'https://i.pravatar.cc/300?u=rachel-mscircle' },
  { email: 'samuel@test.com', displayName: 'Samuel Tan', role: 'alumni', programme: 'Electrical & Electronic Engineering', graduationYear: 2023, interests: ['Power Engineering', 'Battery', 'EVs'], bio: 'Battery systems engineer at Tesla.', profilePhoto: 'https://i.pravatar.cc/300?u=samuel-mscircle' },
  { email: 'tina@test.com', displayName: 'Tina Ang', role: 'student', programme: 'Electrical & Electronic Engineering', graduationYear: null, interests: ['AI', 'NLP', 'Data Science'], bio: 'Year 2 student exploring NLP applications in engineering.', profilePhoto: 'https://i.pravatar.cc/300?u=tina-mscircle' },
  { email: 'victor@test.com', displayName: 'Victor Lim', role: 'alumni', programme: 'Computer Engineering', graduationYear: 2022, interests: ['Embedded Systems', 'RTOS', 'Firmware'], bio: 'Firmware engineer at Micron.', profilePhoto: 'https://i.pravatar.cc/300?u=victor-mscircle' },
];

// Helper: pick random subset
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Auth helpers
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
  // Process in batches of 500
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + 400);
    for (const docSnap of chunk) {
      for (const sub of subcollections) {
        const subSnap = await docSnap.ref.collection(sub).get();
        subSnap.docs.forEach((subDoc) => batch.delete(subDoc.ref));
      }
      batch.delete(docSnap.ref);
    }
    await batch.commit();
  }
  console.log(`  ${collectionPath}: deleted ${docs.length} docs`);
}

async function deleteAuthUsers() {
  for (const u of USERS) {
    try {
      const existing = await authAdmin.getUserByEmail(u.email);
      await authAdmin.deleteUser(existing.uid);
      console.log(`  Auth user deleted: ${u.email}`);
    } catch {
      // doesn't exist
    }
  }
}

async function seed() {
  console.log('\n=== Seeding Firebase ===\n');

  // 0. Clean slate
  console.log('0. Cleaning existing data...');
  await deleteCollection('notifications');
  await deleteCollection('reports');
  await deleteCollection('mentorships', ['requests']);
  await deleteCollection('jobs', ['applications']);
  await deleteCollection('events');
  await deleteCollection('chats', ['messages']);
  await deleteCollection('users');
  await deleteAuthUsers();
  console.log('  Clean slate ready!\n');

  // 1. Create users
  console.log('1. Creating users...');
  const uidMap = {};
  for (const u of USERS) {
    const uid = await createOrGetUser(u);
    uidMap[u.email] = uid;

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
        expoPushToken: null,
        notificationsEnabled: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`  Firestore doc: users/${uid}`);
  }

  // Build uid arrays by role
  const allUids = USERS.map((u) => uidMap[u.email]);
  const adminUids = USERS.filter((u) => u.role === 'admin').map((u) => uidMap[u.email]);
  const nonAdminUsers = USERS.filter((u) => u.role !== 'admin');
  const nonAdminUids = nonAdminUsers.map((u) => uidMap[u.email]);
  const alumniUsers = USERS.filter((u) => u.role === 'alumni');
  const studentUsers = USERS.filter((u) => u.role === 'student');

  // Helper to get display name from uid
  const nameOf = (uid) => USERS.find((u) => uidMap[u.email] === uid)?.displayName || 'Unknown';

  // 2. Official events (4)
  console.log('\n2. Creating official events...');
  const officialEvents = [
    { title: 'EEE Industry Night 2026', description: 'Annual networking event connecting EEE students with industry professionals. Guest speakers from Dyson, ST Engineering, and more.', date: new Date('2026-04-15T18:00:00'), location: 'LT1, NTU North Spine', coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop', maxCapacity: 200 },
    { title: 'NTU EEE Career Fair 2026', description: 'Meet top employers recruiting EEE graduates. Companies include Intel, Micron, TSMC, and Infineon. Bring your resume!', date: new Date('2026-05-10T10:00:00'), location: 'NTU Convention Centre', coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop', maxCapacity: 500 },
    { title: 'MSCircle Launch Ceremony', description: 'Official launch of the MSCircle alumni networking platform. Join us for the unveiling, demo, and networking session.', date: new Date('2026-04-01T14:00:00'), location: 'The Hive, NTU', coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop', maxCapacity: 150 },
    { title: 'EEE Alumni Homecoming 2026', description: 'Reconnect with batchmates, tour the updated labs, and hear about the latest EEE research breakthroughs.', date: new Date('2026-06-20T10:00:00'), location: 'EEE Building, NTU', coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop', maxCapacity: 300 },
  ];

  const eventRefs = [];
  for (const evt of officialEvents) {
    const attendees = pickRandom(nonAdminUids, 5 + Math.floor(Math.random() * 10));
    const ref = db.collection('events').doc();
    await ref.set({
      ...evt,
      type: 'official',
      status: 'approved',
      createdBy: adminUids[0],
      creatorName: nameOf(adminUids[0]),
      attendees,
      attendeeCount: attendees.length,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    eventRefs.push(ref.id);
    console.log(`  Official event: ${evt.title}`);
  }

  // 3. User-created events (10) 
  console.log('\n3. Creating user events...');
  const userEvents = [
    { title: 'Arduino Workshop for Beginners', description: 'Hands-on workshop to build your first IoT project with Arduino. All materials provided!', date: new Date('2026-04-20T14:00:00'), location: 'Hardware Lab 2, S2-B4a', maxCapacity: 30 },
    { title: 'Python for Signal Processing', description: 'Learn FFT, filtering, and spectral analysis with NumPy/SciPy.', date: new Date('2026-05-01T10:00:00'), location: 'Computer Lab 3, N4-B2c', maxCapacity: 40 },
    { title: 'Resume Review & Mock Interview', description: 'Alumni-led session to review your resume and practice technical interviews.', date: new Date('2026-05-05T15:00:00'), location: 'Seminar Room 1, S1-B1a', maxCapacity: 20 },
    { title: 'PCB Design with KiCad', description: 'From schematic capture to PCB layout — a complete walkthrough using KiCad.', date: new Date('2026-05-08T13:00:00'), location: 'Electronics Lab, S2-B3', maxCapacity: 25 },
    { title: 'Introduction to ROS2', description: 'Get started with Robot Operating System 2 for your robotics projects.', date: new Date('2026-05-12T14:00:00'), location: 'Robotics Lab, N3-B1', maxCapacity: 20 },
    { title: 'MATLAB for Control Systems', description: 'Hands-on MATLAB/Simulink session for control system design and simulation.', date: new Date('2026-05-15T10:00:00'), location: 'Computer Lab 1, N4-B2a', maxCapacity: 35 },
    { title: 'Startup Pitch Night', description: 'Students and alumni pitch their startup ideas. Prizes for top 3!', date: new Date('2026-05-18T19:00:00'), location: 'LT2, NTU North Spine', maxCapacity: 100 },
    { title: '5G Technology Seminar', description: 'Overview of 5G NR architecture, beamforming, and mmWave challenges.', date: new Date('2026-05-22T14:00:00'), location: 'Seminar Room 3, S1-B3', maxCapacity: 50 },
    { title: 'Power Electronics Study Group', description: 'Weekly study group for EE4011 Power Electronics. All welcome!', date: new Date('2026-05-25T16:00:00'), location: 'Tutorial Room 5, S2-B2', maxCapacity: 15 },
    { title: 'AI in Healthcare Workshop', description: 'Explore how AI and ML are transforming biomedical engineering and healthcare.', date: new Date('2026-05-28T10:00:00'), location: 'LT3, NTU South Spine', maxCapacity: 60 },
  ];

  for (const evt of userEvents) {
    const creator = randomFrom(nonAdminUsers);
    const creatorUid = uidMap[creator.email];
    const otherUids = nonAdminUids.filter((u) => u !== creatorUid);
    const attendees = [creatorUid, ...pickRandom(otherUids, 2 + Math.floor(Math.random() * 6))];
    const ref = db.collection('events').doc();
    await ref.set({
      ...evt,
      type: 'user-created',
      status: 'approved',
      coverImage: null,
      createdBy: creatorUid,
      creatorName: creator.displayName,
      attendees,
      attendeeCount: attendees.length,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    eventRefs.push(ref.id);
    console.log(`  User event: ${evt.title} (by ${creator.displayName})`);
  }

  // 4. Jobs (10) 
  console.log('\n4. Creating jobs...');
  const SPECIALISATIONS = ['Communications', 'Computer Control', 'Electronics', 'Power Engineering', 'Signal Processing'];
  const jobListings = [
    { title: 'Graduate Embedded Systems Engineer', company: 'Schneider Electric', description: 'Develop next-gen IoT solutions for smart buildings. Fresh graduates with embedded C/C++ welcome.', location: 'Singapore', tags: ['Electronics', 'Computer Control'] },
    { title: 'RF Design Engineer', company: 'Qualcomm', description: 'Design and optimise RF front-end modules for 5G smartphones.', location: 'Singapore', tags: ['Communications', 'Electronics'] },
    { title: 'Power Systems Analyst', company: 'SP Group', description: 'Analyse and model power distribution networks for grid stability.', location: 'Singapore', tags: ['Power Engineering'] },
    { title: 'DSP Algorithm Developer', company: 'ST Engineering', description: 'Develop real-time signal processing algorithms for radar systems.', location: 'Singapore', tags: ['Signal Processing'] },
    { title: 'Automation Engineer', company: 'ABB', description: 'Design PLC-based automation systems for manufacturing plants.', location: 'Singapore', tags: ['Computer Control'] },
    { title: 'VLSI Design Engineer', company: 'GlobalFoundries', description: 'Digital and analog IC design for advanced process nodes.', location: 'Singapore', tags: ['Electronics'] },
    { title: 'Battery Systems Engineer', company: 'Tesla', description: 'Work on battery management systems for electric vehicles.', location: 'Singapore', tags: ['Power Engineering', 'Electronics'] },
    { title: 'Telecom Network Engineer', company: 'Singtel', description: 'Plan and optimise mobile network infrastructure across Singapore.', location: 'Singapore', tags: ['Communications'] },
    { title: 'Machine Learning Engineer', company: 'Dyson', description: 'Build ML models for robotic vacuum navigation and sensor fusion.', location: 'Singapore', tags: ['Signal Processing', 'Computer Control'] },
    { title: 'Firmware Developer', company: 'Micron', description: 'Develop firmware for SSD controllers and memory interfaces.', location: 'Singapore', tags: ['Electronics', 'Computer Control'] },
  ];

  for (const job of jobListings) {
    const poster = randomFrom(alumniUsers);
    const posterUid = uidMap[poster.email];
    const ref = db.collection('jobs').doc();
    await ref.set({
      ...job,
      type: 'job',
      postedBy: posterUid,
      posterName: poster.displayName,
      status: 'approved',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`  Job: ${job.title} at ${job.company}`);
  }

  // 5. Mentorships (10) 
  console.log('\n5. Creating mentorships...');
  const mentorshipListings = [
    { title: 'Power Systems & Renewable Energy Mentor', expertise: ['Power Engineering'], availability: 'Weekends, 2 hours/week' },
    { title: 'RF & Antenna Design Guidance', expertise: ['Communications', 'Electronics'], availability: 'Weekday evenings' },
    { title: 'Embedded Systems Career Advice', expertise: ['Computer Control', 'Electronics'], availability: 'Saturdays, 1 hour' },
    { title: 'Signal Processing Research Mentor', expertise: ['Signal Processing'], availability: 'Flexible, 2 hours/week' },
    { title: '5G & Wireless Communications Mentor', expertise: ['Communications'], availability: 'Bi-weekly, 1.5 hours' },
    { title: 'VLSI & Semiconductor Industry Guide', expertise: ['Electronics'], availability: 'Monthly, 2 hours' },
    { title: 'Smart Grid & EV Systems Mentor', expertise: ['Power Engineering', 'Computer Control'], availability: 'Weekends, 1 hour' },
    { title: 'Control Systems & Automation Mentor', expertise: ['Computer Control'], availability: 'Weekday evenings, 1 hour' },
    { title: 'Audio & Speech Processing Mentor', expertise: ['Signal Processing', 'Communications'], availability: 'Flexible schedule' },
    { title: 'PCB Design & Prototyping Guide', expertise: ['Electronics'], availability: 'Saturdays, 2 hours' },
  ];

  for (let i = 0; i < mentorshipListings.length; i++) {
    const ml = mentorshipListings[i];
    const mentor = alumniUsers[i % alumniUsers.length];
    const mentorUid = uidMap[mentor.email];
    const ref = db.collection('mentorships').doc();
    await ref.set({
      title: ml.title,
      mentorId: mentorUid,
      mentorName: mentor.displayName,
      company: '',
      description: `I can mentor students interested in ${ml.expertise.join(', ').toLowerCase()} topics. Happy to share industry experience and career advice.`,
      expertise: ml.expertise,
      availability: ml.availability,
      location: 'Singapore / Online',
      tags: ml.expertise,
      status: 'approved',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log(`  Mentorship: ${ml.title} (${mentor.displayName})`);
  }

  // 6. Group chats (2)
  console.log('\n6. Creating group chats...');

  const groupChats = [
    { name: 'EEE Study Group', participants: pickRandom(nonAdminUids, 8) },
    { name: 'Final Year Project Help', participants: pickRandom(nonAdminUids, 6) },
  ];

  const chatConversations = [
    ['Hey everyone! How is the revision going?', 'Pretty good, just finished Chapter 3.', 'Anyone want to study together this weekend?', 'Count me in!', 'Same here, library at 2pm?', 'Sounds good, see you all there!'],
    ['Has anyone started on the FYP proposal?', 'Yes, I submitted mine last week.', 'Any tips on choosing a supervisor?', 'Pick someone whose research interests align with yours.', 'Prof Lee is great for signal processing topics.', 'Thanks for the advice!', 'Good luck everyone!'],
  ];

  for (let i = 0; i < groupChats.length; i++) {
    const gc = groupChats[i];
    const conv = chatConversations[i];
    const creator = gc.participants[0];
    const lastSender = gc.participants[conv.length % gc.participants.length];

    const ref = db.collection('chats').doc();
    await ref.set({
      type: 'group',
      participants: gc.participants,
      name: gc.name,
      createdBy: creator,
      matchType: 'manual',
      cohortYear: null,
      lastMessage: {
        text: conv[conv.length - 1],
        senderId: lastSender,
        senderName: nameOf(lastSender),
        timestamp: FieldValue.serverTimestamp(),
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    for (let m = 0; m < conv.length; m++) {
      const sender = gc.participants[m % gc.participants.length];
      await ref.collection('messages').add({
        senderId: sender,
        senderName: nameOf(sender),
        text: conv[m],
        type: 'text',
        imageUrl: null,
        fileUrl: null,
        fileName: null,
        readBy: [sender],
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    console.log(`  Group chat: ${gc.name} (${gc.participants.length} members, ${conv.length} messages)`);
  }

  // 7. Direct chats (10 per non-admin user)
  console.log('\n7. Creating direct chats...');

  const directMessageTemplates = [
    ['Hi! Are you in Prof Tan\'s class?', 'Yes! Are you taking EE4013 too?', 'Yeah, want to form a study group?', 'Sure, that would be great!'],
    ['Hey, saw your post about the Arduino workshop. Is it still open?', 'Yes, we still have spots! Sign up on MSCircle.', 'Awesome, just registered. Thanks!'],
    ['Hi, I noticed we share similar interests. Would love to connect!', 'Hey! Yes, always happy to meet fellow EEE students.', 'What year are you in?', 'Year 3, you?', 'Same! We should collaborate on something.'],
    ['Thanks for the career advice earlier!', 'No problem! Let me know if you have more questions.', 'Will do, really appreciate the help.'],
    ['Hey, are you going to the Industry Night?', 'Definitely! Are you?', 'Yes, hoping to network with some companies.', 'Same here. Let\'s go together!', 'Sounds like a plan!'],
    ['Hi! I saw you work at Qualcomm. Could I ask about the application process?', 'Of course! Happy to share my experience.', 'That would be amazing, thank you!', 'Let me know when you are free for a call.'],
    ['Do you have the notes from last week\'s lecture?', 'Yes, I\'ll send them over!', 'Thank you so much!', 'No worries, good luck with the exam!'],
    ['Hey, want to grab lunch after lab?', 'Sure! Canteen 2?', 'Sounds good, see you at 12.'],
    ['Congrats on the internship offer!', 'Thanks! I\'m really excited about it.', 'You deserve it, you worked really hard!'],
    ['Hi, are you the mentor for power systems?', 'Yes I am! Are you interested?', 'Very much so. When can we meet?', 'How about Saturday afternoon?', 'Perfect, I will send a request on MSCircle.'],
    ['Hey, did you finish the lab report?', 'Almost done, struggling with the analysis section.', 'Same here. Want to compare notes?', 'Yes please, that would help a lot.'],
    ['Hi! Loved your presentation today.', 'Thank you! That means a lot.', 'Your section on 5G beamforming was really clear.', 'I can share my slides if you want.', 'That would be great!'],
  ];

  let directChatCount = 0;
  const createdPairs = new Set();

  for (const userObj of nonAdminUsers) {
    const uid = uidMap[userObj.email];
    const others = nonAdminUids.filter((u) => u !== uid);
    const partners = pickRandom(others, 10);

    for (const partnerUid of partners) {
      // Avoid duplicate pairs
      const pairKey = [uid, partnerUid].sort().join('_');
      if (createdPairs.has(pairKey)) continue;
      createdPairs.add(pairKey);

      const conv = directMessageTemplates[directChatCount % directMessageTemplates.length];
      const participants = [uid, partnerUid];
      const lastSender = participants[(conv.length - 1) % 2];

      const ref = db.collection('chats').doc();
      await ref.set({
        type: 'direct',
        participants,
        name: null,
        createdBy: uid,
        matchType: 'manual',
        cohortYear: null,
        lastMessage: {
          text: conv[conv.length - 1],
          senderId: lastSender,
          senderName: nameOf(lastSender),
          timestamp: FieldValue.serverTimestamp(),
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      for (let m = 0; m < conv.length; m++) {
        const sender = participants[m % 2];
        await ref.collection('messages').add({
          senderId: sender,
          senderName: nameOf(sender),
          text: conv[m],
          type: 'text',
          imageUrl: null,
          fileUrl: null,
          fileName: null,
          readBy: [sender],
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      directChatCount++;
    }
  }
  console.log(`  Created ${directChatCount} direct chats with messages`);

  // Completion Message
  console.log('\n=== Seed complete! ===');
  console.log(`\nTest accounts (password for all: ${PASSWORD}):`);
  for (const u of USERS) {
    const pad = u.email.padEnd(22);
    const role = u.role.padEnd(8);
    console.log(`  ${pad} (${role}) — uid: ${uidMap[u.email]}`);
  }
  console.log('');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
