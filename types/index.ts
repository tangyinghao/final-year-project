import { Timestamp } from 'firebase/firestore';

//  User 
export type UserRole = 'student' | 'alumni' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  displayNameLower?: string;
  role: UserRole;
  profilePhoto: string | null;
  programme: string;
  graduationYear: number | null;
  interests: string[];
  languages?: string[];
  bio: string;
  status: UserStatus;
  onboarded: boolean;
  matchingEnabled?: boolean;
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

//  Chat 
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
  groupPhoto?: string | null;
  lastMessage: LastMessage | null;
  unreadCount: Record<string, number>;
  owner: string | null;
  listed?: boolean;
  maxCapacity?: number | null;
  purpose?: string | null;
  tags?: string[];
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

//  Cohort 
export interface Cohort {
  year: number;
  memberIds: string[];
  chatId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

//  Event 
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

//  Job 
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
  status: 'pending' | 'accepted' | 'declined';
}

//  Mentorship 
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

//  Report 
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

//  Saved Items 
export interface SavedItem {
  itemId: string;
  itemType: 'job' | 'mentorship';
  savedAt: Timestamp;
}

//  Footprint 
export type FootprintMapType = 'ntu' | 'singapore';

export interface FootprintCheckin {
  zoneId: string;
  zoneName: string;
  mapType: FootprintMapType;
  checkedInAt: Timestamp;
}

//  Smart Match Discovery
export type MatchPurpose = 'friends' | 'study' | 'networking' | 'mentorship' | 'mixed';

export interface DiscoveryResult {
  userId: string;
  displayName: string;
  profilePhoto: string | null;
  programme: string;
  role: UserRole;
  score: number;
  reasons: string[];
}

export interface GroupDiscoveryResult {
  chatId: string;
  name: string;
  purpose: string | null;
  tags: string[];
  memberCount: number;
  maxCapacity: number | null;
  ownerName: string;
  score: number;
  reasons: string[];
  members: {
    uid: string;
    displayName: string;
    profilePhoto: string | null;
  }[];
  memberPhotos: (string | null)[];
  memberNames: string[];
}
