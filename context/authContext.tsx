import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebaseConfig';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean | undefined;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: 'student' | 'alumni',
    graduationYear?: number
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  };

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.uid);
      setUser(profile);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await fetchUserProfile(fbUser.uid);
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e: any) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email address.';
      if (msg.includes('(auth/invalid-credential)')) msg = 'Invalid email or password.';
      return { success: false, error: msg };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: 'student' | 'alumni',
    graduationYear?: number
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      const userDoc: Record<string, any> = {
        uid,
        email,
        displayName,
        role,
        profilePhoto: null,
        programme: '',
        graduationYear: graduationYear ?? null,
        interests: [],
        bio: '',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userDoc);
      return { success: true };
    } catch (e: any) {
      let msg = e.message;
      if (msg.includes('(auth/email-already-in-use)')) msg = 'Email is already in use.';
      if (msg.includes('(auth/weak-password)')) msg = 'Password must be at least 6 characters.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, isAuthenticated, login, register, logout, resetPassword, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be wrapped inside AuthContextProvider');
  }
  return value;
};
