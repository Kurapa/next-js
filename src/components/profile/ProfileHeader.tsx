// src/components/profile/ProfileHeader.tsx
"use client";

import { useState } from "react";
import { Camera, Mail, Phone, MapPin, Calendar, Edit2 } from "lucide-react";
import { UserProfile } from "@/lib/profile";

interface ProfileHeaderProps {
  profile: UserProfile;
  onEditPhoto: () => void;
}

export default function ProfileHeader({ profile, onEditPhoto }: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      farmer: 'bg-green-100 text-green-700 border-green-200',
      buyer: 'bg-blue-100 text-blue-700 border-blue-200',
      advisor: 'bg-purple-100 text-purple-700 border-purple-200',
    };

    return (
      <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${colors[role] || colors.farmer}`}>
        {role?role?.charAt(0).toUpperCase() + role?.slice(1):"role"}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
              {profile.photoURL && !imageError ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-green-500 text-white text-3xl font-bold">
                  {getInitials(profile.displayName)}
                </div>
              )}
            </div>
            
            {/* Edit Photo Button */}
            <button
              onClick={onEditPhoto}
              className="absolute bottom-0 right-0 p-3 bg-white text-emerald-600 rounded-full shadow-lg hover:bg-emerald-50 transition-all group-hover:scale-110"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold">{profile.displayName}</h1>
              {getRoleBadge(profile.role)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5" />
                <span>{profile.email}</span>
              </div>
              
              {profile.phoneNumber && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}

              {profile.farmDetails?.location && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{profile.farmDetails.location.city}, {profile.farmDetails.location.state}</span>
                </div>
              )}

              {profile.stats?.memberSince && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Member since {new Date(profile.stats.memberSince).getFullYear()}</span>
                </div>
              )}
            </div>

            {/* Farm Details */}
            {profile.farmDetails && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="font-semibold mb-2">{profile.farmDetails.farmName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Farm Size:</span>
                    <span className="ml-2 font-semibold">{profile.farmDetails.farmSize} acres</span>
                  </div>
                  <div>
                    <span className="text-white/70">Farm Type:</span>
                    <span className="ml-2 font-semibold">{profile.farmDetails.farmType}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 min-w-[200px]">
            <h3 className="text-sm font-semibold mb-4 text-white/80">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold">{profile.stats?.totalCrops || 0}</div>
                <div className="text-sm text-white/70">Total Crops</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{profile.stats?.totalFields || 0}</div>
                <div className="text-sm text-white/70">Active Fields</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}