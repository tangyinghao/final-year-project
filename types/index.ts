import { Timestamp } from 'firebase/firestore';

// ── User ──────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'alumni' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  profilePhoto: string | null;
  programme: string;
  graduationYear: number | null;
  interests: string[];
  bio: string;
  status: UserStatus;
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Chat ──────────────────────────────────────────────────────────────
export type ChatType = 'direct' | 'group' | 'cohort';
export type MatchType = 'manual' | 'algorithm';

export interface LastMessage {
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

export interface Chat {
  id: string;
  type: ChatType;
  participants: string[];
  name: string | null;
  createdBy: string;
  matchType: MatchType;
  cohortYear: number | null;
  lastMessage: LastMessage | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: MessageType;
  imageUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: Timestamp;
  readBy: string[];
}

// ── Cohort ────────────────────────────────────────────────────────────
export interface Cohort {
  year: number;
  memberIds: string[];
  chatId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Event ─────────────────────────────────────────────────────────────
export type EventType = 'official' | 'user-created';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: ModerationStatus;
  date: Timestamp;
  location: string;
  coverImage: string | null;
  maxCapacity: number | null;
  createdBy: string;
  creatorName: string;
  attendees: string[];
  attendeeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Job ───────────────────────────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'job';
  tags: string[];
  postedBy: string;
  posterName: string;
  status: ModerationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JobApplication {
  applicantId: string;
  applicantName: string;
  cvUrl: string | null;
  appliedAt: Timestamp;
}

// ── Mentorship ────────────────────────────────────────────────────────
export interface Mentorship {
  id: string;
  title: string;
  mentorId: string;
  mentorName: string;
  company: string;
  description: string;
  expertise: string[];
  availability: string;
  location: string;
  tags: string[];
  status: ModerationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MentorshipRequest {
  requesterId: string;
  requesterName: string;
  message: string | null;
  requestedAt: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
}

// ── Report ────────────────────────────────────────────────────────────
export interface Report {
  id: string;
  reportedUserId: string;
  reportedBy: string;
  reason: string;
  additionalDetails: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: Timestamp;
  reviewedAt: Timestamp | null;
  reviewedBy: string | null;
}

// ── Notification ──────────────────────────────────────────────────────
export type NotificationType = 'message' | 'event' | 'approval' | 'report' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: {
    route: string;
    [key: string]: string;
  };
  read: boolean;
  createdAt: Timestamp;
}

// ── Saved Items ───────────────────────────────────────────────────────
export interface SavedItem {
  itemId: string;
  itemType: 'job' | 'mentorship';
  savedAt: Timestamp;
}

// ── Footprint ─────────────────────────────────────────────────────────
export type FootprintMapType = 'ntu' | 'singapore';

export interface FootprintCheckin {
  zoneId: string;
  zoneName: string;
  mapType: FootprintMapType;
  checkedInAt: Timestamp;
}

// ── Smart Matching ────────────────────────────────────────────────────
export interface MatchRequest {
  mode: 'individual' | 'group';
  currentUserId: string;
  preferences: {
    interests?: string[];
    groupSize?: number;
    programme?: string;
    graduationYear?: number | null;
  };
}

export interface MatchResult {
  userIds: string[];
  score: number;
  explanation: string[];
}

export interface MatchResponse {
  matches: MatchResult[];
}
