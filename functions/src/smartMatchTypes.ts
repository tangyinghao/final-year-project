export type MatchPurpose = 'friends' | 'study' | 'networking' | 'mentorship' | 'mixed';

export interface UserData {
  uid: string;
  displayName: string;
  role: 'student' | 'alumni' | 'admin';
  programme: string;
  graduationYear: number | null;
  interests: string[];
  languages?: string[];
  matchingEnabled?: boolean;
  status: string;
}

export interface ScoredPair {
  userId: string;
  score: number;
  reasons: string[];
}
