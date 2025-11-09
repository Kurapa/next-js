// src/lib/profile.ts

import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword, User } from 'firebase/auth';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'farmer' | 'buyer' | 'advisor' | 'admin';
  location?: string;
  // Farm Details
  farmDetails?: {
    farmName: string;
    farmSize: number; // in acres
    farmType: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
    establishedYear?: number;
  };

  // Preferences
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      diseaseAlerts: boolean;
      weatherAlerts: boolean;
      marketUpdates: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };

  // Stats
  stats?: {
    totalCrops: number;
    totalFields: number;
    memberSince: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        uid: userId,
        ...userSnap.data(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update Firebase Auth profile
 */
export async function updateAuthProfile(
  user: User,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  try {
    await updateProfile(user, {
      displayName: displayName || user.displayName || undefined,
      photoURL: photoURL || user.photoURL || undefined,
    });
  } catch (error) {
    console.error('Error updating auth profile:', error);
    throw error;
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(user: User, newEmail: string): Promise<void> {
  try {
    await updateEmail(user, newEmail);
    // Also update in Firestore
    await updateUserProfile(user.uid, { email: newEmail });
  } catch (error) {
    console.error('Error updating email:', error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(user: User, newPassword: string): Promise<void> {
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}