import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { MatchRequest, MatchResponse, MatchResult, UserProfile } from '@/types';

/**
 * Client-side smart matching service for MVP.
 *
 * Uses the same MatchRequest / MatchResponse contract that the future
 * Cloud Function `getMatchResults` will use, so screens can switch
 * implementations without code changes.
 */
export async function getMatchResults(req: MatchRequest): Promise<MatchResponse> {
  // Fetch candidate users from Firestore
  const q = query(
    collection(db, 'users'),
    where('status', '==', 'active'),
    limit(100)
  );
  const snap = await getDocs(q);
  const candidates: UserProfile[] = [];
  snap.forEach((d) => {
    const u = d.data() as UserProfile;
    if (u.uid !== req.currentUserId) candidates.push(u);
  });

  // Score each candidate
  const scored = candidates.map((c) => scoreCandidate(c, req));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  if (req.mode === 'individual') {
    // Return top individual matches
    const matches: MatchResult[] = scored.slice(0, 10).map((s) => ({
      userIds: [s.user.uid],
      score: s.score,
      explanation: s.reasons,
    }));
    return { matches };
  }

  // Group mode: form groups from top-scored candidates
  const groupSize = req.preferences.groupSize ?? 5;
  const matches = formGroups(scored, req.currentUserId, groupSize);
  return { matches };
}

// ── Internal scoring ─────────────────────────────────────────────────

interface ScoredUser {
  user: UserProfile;
  score: number;
  reasons: string[];
}

function scoreCandidate(candidate: UserProfile, req: MatchRequest): ScoredUser {
  let score = 0;
  const reasons: string[] = [];
  const prefs = req.preferences;

  // Interest overlap
  if (prefs.interests && prefs.interests.length > 0) {
    const overlap = candidate.interests.filter((i) =>
      prefs.interests!.some((pi) => pi.toLowerCase() === i.toLowerCase())
    );
    if (overlap.length > 0) {
      score += overlap.length * 20;
      reasons.push(`Shared interests: ${overlap.join(', ')}`);
    }
  }

  // Programme match
  if (prefs.programme && candidate.programme) {
    if (candidate.programme.toLowerCase().includes(prefs.programme.toLowerCase())) {
      score += 25;
      reasons.push(`Same programme: ${candidate.programme}`);
    }
  }

  // Graduation year proximity
  if (prefs.graduationYear && candidate.graduationYear) {
    const diff = Math.abs(prefs.graduationYear - candidate.graduationYear);
    if (diff === 0) {
      score += 20;
      reasons.push('Same graduation year');
    } else if (diff <= 2) {
      score += 10;
      reasons.push('Similar graduation year');
    }
  }

  // Role-based bonus (alumni mentoring students, students studying together)
  if (candidate.role === 'alumni') {
    score += 5;
    reasons.push('Alumni connection');
  }

  // Normalize to percentage (cap at 99)
  score = Math.min(99, Math.max(10, score));

  if (reasons.length === 0) {
    reasons.push('NTU community member');
  }

  return { user: candidate, score, reasons };
}

function formGroups(
  scored: ScoredUser[],
  currentUserId: string,
  groupSize: number
): MatchResult[] {
  const groups: MatchResult[] = [];
  const used = new Set<string>();
  const pool = scored.filter((s) => s.score > 0);

  // Form up to 5 groups
  for (let g = 0; g < 5 && pool.length > 0; g++) {
    const members: string[] = [currentUserId];
    const allReasons: string[] = [];
    let totalScore = 0;

    for (const s of pool) {
      if (used.has(s.user.uid)) continue;
      if (members.length >= groupSize) break;
      members.push(s.user.uid);
      used.add(s.user.uid);
      totalScore += s.score;
      s.reasons.forEach((r) => {
        if (!allReasons.includes(r)) allReasons.push(r);
      });
    }

    if (members.length < 2) break;

    groups.push({
      userIds: members,
      score: Math.round(totalScore / (members.length - 1)),
      explanation: allReasons.slice(0, 4),
    });
  }

  return groups;
}
