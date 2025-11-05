// src/components/profile/NotificationsForm.tsx
"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, AlertTriangle, Cloud, ShoppingCart, Save, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/profile";

interface NotificationsFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export default function NotificationsForm({ profile, onSave }: NotificationsFormProps) {
  const [notifications, setNotifications] = useState({
    email: profile.preferences?.notifications?.email ?? true,
    sms: profile.preferences?.notifications?.sms ?? false,
    push: profile.preferences?.notifications?.push ?? true,
    diseaseAlerts: profile.preferences?.notifications?.diseaseAlerts ?? true,
    weatherAlerts: profile.preferences?.notifications?.weatherAlerts ?? true,
    marketUpdates: profile.preferences?.notifications?.marketUpdates ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await onSave({
        preferences: {
          ...profile.preferences,
          notifications,
        } as any,
      });
      setMessage({ type: 'success', text: 'Notification preferences updated!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div className="space-y-6">
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

      {/* Notification Channels */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notification Channels
        </h3>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates via email</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('email')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.email ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.email ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-500">Get text messages for alerts</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('sms')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.sms ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.sms ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Push */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Browser and mobile app alerts</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('push')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.push ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.push ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Types */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Alert Preferences
        </h3>

        <div className="space-y-4">
          {/* Disease Alerts */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Disease Alerts</p>
                <p className="text-sm text-gray-500">Critical crop disease detections</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('diseaseAlerts')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.diseaseAlerts ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.diseaseAlerts ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Weather Alerts */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Weather Alerts</p>
                <p className="text-sm text-gray-500">Severe weather warnings</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('weatherAlerts')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.weatherAlerts ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.weatherAlerts ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>

          {/* Market Updates */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Market Updates</p>
                <p className="text-sm text-gray-500">Price changes and opportunities</p>
              </div>
            </div>
            <button
              onClick={() => toggleNotification('marketUpdates')}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notifications.marketUpdates ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                notifications.marketUpdates ? 'translate-x-6' : ''
              }`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
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
            Save Preferences
          </>
        )}
      </button>
    </div>
  );
}