// src/components/profile/PersonalInfoForm.tsx
"use client";

import { useState } from "react";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/profile";

interface PersonalInfoFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export default function PersonalInfoForm({ profile, onSave }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    role: profile.role || 'farmer',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await onSave(formData);
      setMessage({ type: 'success', text: 'Personal information updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update information' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Full Name
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Changing email will require re-authentication
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          placeholder="+91 XXXXX XXXXX"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
        >
          <option value="farmer">Farmer</option>
          <option value="buyer">Buyer</option>
          <option value="advisor">Agricultural Advisor</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Changes
          </>
        )}
      </button>
    </form>
  );
}