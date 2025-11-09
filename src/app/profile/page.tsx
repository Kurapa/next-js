// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SettingsTabs from "@/components/profile/SettingsTabs";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import FarmDetailsForm from "@/components/profile/FarmDetailsForm";
import NotificationsForm from "@/components/profile/NotificationsForm";
import SecurityForm from "@/components/profile/SecurityForm";
import { useAuth } from "@/app/contexts/AuthContext";
import { getUserProfile, updateUserProfile, updateAuthProfile, UserProfile } from "@/lib/profile";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      loadProfile();
    }
  }, [user, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let userProfile = await getUserProfile(user.uid);

      // If profile doesn't exist, create a default one
      if (!userProfile) {
        userProfile = {
          uid: user.uid,
          displayName: user.displayName || 'User',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: 'farmer',
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: {
            totalCrops: 0,
            totalFields: 0,
            memberSince: new Date().toISOString(),
          },
        };
      }

      setProfile(userProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Update Firestore
      await updateUserProfile(user.uid, data);

      // Update Firebase Auth if displayName changed
      if (data.displayName) {
        await updateAuthProfile(user, data.displayName);
      }

      // Reload profile
      await loadProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error("User not authenticated");

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect');
      }
      throw error;
    }
  };

  const handleEditPhoto = () => {
    // Implement photo upload logic
    alert('Photo upload feature coming soon!');
  };

  if (!user || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Profile Header */}
        <ProfileHeader profile={profile} onEditPhoto={handleEditPhoto} />

        {/* Settings Tabs */}
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {activeTab === 'personal' && (
            <PersonalInfoForm profile={profile} onSave={handleSaveProfile} />
          )}

          {activeTab === 'farm' && (
            <FarmDetailsForm profile={profile} onSave={handleSaveProfile} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsForm profile={profile} onSave={handleSaveProfile} />
          )}

          {activeTab === 'security' && (
            <SecurityForm user={user} onUpdatePassword={handleUpdatePassword} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}