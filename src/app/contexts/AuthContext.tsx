// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signUpWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyOTP: (verificationId: string, otp: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setupRecaptcha: (elementId: string) => RecaptchaVerifier;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create user document in Firestore
  const createUserDocument = async (user: User, additionalData?: any) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email, displayName, photoURL, phoneNumber } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          displayName,
          email,
          phoneNumber,
          photoURL,
          createdAt,
          ...additionalData,
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  // Setup reCAPTCHA for phone auth
  const setupRecaptcha = (elementId: string): RecaptchaVerifier => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          (window as any).recaptchaVerifier = null;
        }
      });
    }
    return (window as any).recaptchaVerifier;
  };

  // Sign up with phone number
  const signUpWithPhone = async (phoneNumber: string): Promise<ConfirmationResult> => {
    try {
      const recaptchaVerifier = setupRecaptcha('recaptcha-container');
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message);
    }
  };

  // Verify OTP
  const verifyOTP = async (verificationId: string, otp: string): Promise<void> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      await createUserDocument(result.user);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error('Invalid OTP. Please try again.');
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(result.user, {
        displayName: name,
      });

      // Send verification email
      await sendEmailVerification(result.user);

      // Create user document
      await createUserDocument(result.user, { displayName: name });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signUpWithPhone,
    verifyOTP,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    sendPasswordReset,
    logout,
    setupRecaptcha,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}