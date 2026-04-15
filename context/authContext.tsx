import { auth, db } from '@/config/firebaseConfig';
import { UserProfile } from '@/types';
import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
    let userUnsub: (() => void) | null = null;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      // Clean up previous user doc listener
      if (userUnsub) { userUnsub(); userUnsub = null; }

      if (fbUser) {
        setFirebaseUser(fbUser);
        const profile = await fetchUserProfile(fbUser.uid);

        // Eject suspended users immediately
        if (profile?.status === 'suspended') {
          await signOut(auth);
          return;
        }

        setUser(profile);
        setIsAuthenticated(true);

        // Listen for real-time suspension
        userUnsub = onSnapshot(doc(db, 'users', fbUser.uid), (snap) => {
          const data = snap.data();
          if (data?.status === 'suspended') {
            signOut(auth);
          }
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      unsub();
      if (userUnsub) userUnsub();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Check if user is suspended before allowing login
      const profile = await fetchUserProfile(cred.user.uid);
      if (profile?.status === 'suspended') {
        await signOut(auth);
        return {
          success: false,
          error: 'Your account has been suspended. If you believe this is a mistake, please contact the admin at admin1@e.ntu.edu.sg.',
        };
      }
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
        displayNameLower: displayName.toLowerCase(),
        role,
        profilePhoto: null,
        programme: '',
        graduationYear: graduationYear ?? null,
        interests: [],
        bio: '',
        status: 'active',
        onboarded: false,
        expoPushToken: null,
        notificationsEnabled: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userDoc);
      setUser({ ...userDoc, createdAt: null, updatedAt: null } as unknown as UserProfile);
      setFirebaseUser(cred.user);
      setIsAuthenticated(true);
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
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email address.';
      if (msg.includes('(auth/too-many-requests)')) msg = 'Too many attempts. Please try again later.';
      return { success: false, error: msg };
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
