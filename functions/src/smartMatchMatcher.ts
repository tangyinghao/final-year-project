import { MatchPurpose, ScoredPair, UserData } from './smartMatchTypes';

//  Scoring

export function scorePair(
  userA: UserData,
  userB: UserData,
  purpose: MatchPurpose
): ScoredPair {
  let raw = 0;
  const reasons: string[] = [];

  // Interest overlap: +15 per shared, max 45
  const sharedInterests = userA.interests.filter((a) =>
    userB.interests.some((b) => b.toLowerCase() === a.toLowerCase())
  );
  if (sharedInterests.length > 0) {
    raw += Math.min(45, sharedInterests.length * 15);
    reasons.push(`Shared interests: ${sharedInterests.slice(0, 3).join(', ')}`);
  }

  // Same programme: +20, related: +10
  if (userA.programme && userB.programme) {
    const a = userA.programme.toLowerCase();
    const b = userB.programme.toLowerCase();
    if (a === b) {
      raw += 20;
      reasons.push(`Same programme: ${userA.programme}`);
    } else if (a.includes(b) || b.includes(a)) {
      raw += 10;
      reasons.push('Related programme');
    }
  }

  // Graduation year proximity: +20 same, +10 within ±2
  if (userA.graduationYear && userB.graduationYear) {
    const diff = Math.abs(userA.graduationYear - userB.graduationYear);
    if (diff === 0) {
      raw += 20;
      reasons.push('Same graduation year');
    } else if (diff <= 2) {
      raw += 10;
      reasons.push('Similar graduation year');
    }
  }

  // Shared language: +10 per shared, max 20
  const langBLower = (userB.languages || []).map((l) => l.toLowerCase());
  const sharedLangs = (userA.languages || []).filter((l) => langBLower.includes(l.toLowerCase()));
  if (sharedLangs.length > 0) {
    raw += Math.min(20, sharedLangs.length * 10);
    reasons.push(`Shared language: ${sharedLangs.slice(0, 2).join(', ')}`);
  }

  // Role complement: +15 for alumni+student in networking/mentorship
  if (
    (purpose === 'networking' || purpose === 'mentorship') &&
    ((userA.role === 'alumni' && userB.role === 'student') ||
      (userA.role === 'student' && userB.role === 'alumni'))
  ) {
    raw += 15;
    reasons.push('Alumni-student connection');
  }

  // Purpose match bonus: +10
  raw += 10;

  const score = Math.min(100, Math.max(5, raw));
  return { userId: userB.uid, score, reasons };
}

//  Hard filters

export function isPairCompatible(
  userA: UserData,
  userB: UserData
): boolean {
  if (userA.uid === userB.uid) return false;
  if (userA.status !== 'active' || userB.status !== 'active') return false;
  if (userA.matchingEnabled !== true || userB.matchingEnabled !== true) return false;
  if (userA.role === 'admin' || userB.role === 'admin') return false;
  return true;
}
