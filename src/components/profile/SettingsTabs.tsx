// src/components/profile/SettingsTabs.tsx
"use client";

import { useState } from "react";
import { User, Building2, Bell, Lock, Globe } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs: Tab[] = [
    { id: 'personal', label: 'Personal Info', icon: <User className="w-5 h-5" /> },
    { id: 'farm', label: 'Farm Details', icon: <Building2 className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-2 overflow-x-auto">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}