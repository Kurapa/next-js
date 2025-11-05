// src/components/profile/FarmDetailsForm.tsx
"use client";

import { useState } from "react";
import { Building2, MapPin, Calendar, Save, Loader2 } from "lucide-react";
import { UserProfile } from "@/lib/profile";

interface FarmDetailsFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => Promise<void>;
}

export default function FarmDetailsForm({ profile, onSave }: FarmDetailsFormProps) {
  const [formData, setFormData] = useState({
    farmName: profile.farmDetails?.farmName || '',
    farmSize: profile.farmDetails?.farmSize || 0,
    farmType: profile.farmDetails?.farmType || '',
    establishedYear: profile.farmDetails?.establishedYear || new Date().getFullYear(),
    address: profile.farmDetails?.location?.address || '',
    city: profile.farmDetails?.location?.city || '',
    state: profile.farmDetails?.location?.state || '',
    country: profile.farmDetails?.location?.country || 'India',
    pincode: profile.farmDetails?.location?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await onSave({
        farmDetails: {
          farmName: formData.farmName,
          farmSize: formData.farmSize,
          farmType: formData.farmType,
          establishedYear: formData.establishedYear,
          location: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
          },
        },
      });
      setMessage({ type: 'success', text: 'Farm details updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update farm details' });
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

      {/* Farm Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Building2 className="w-4 h-4 inline mr-2" />
          Farm Name
        </label>
        <input
          type="text"
          value={formData.farmName}
          onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
          placeholder="Green Valley Farm"
          required
        />
      </div>

      {/* Farm Size and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farm Size (acres)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.farmSize}
            onChange={(e) => setFormData({ ...formData, farmSize: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farm Type
          </label>
          <select
            value={formData.farmType}
            onChange={(e) => setFormData({ ...formData, farmType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            required
          >
            <option value="">Select type</option>
            <option value="Organic">Organic</option>
            <option value="Conventional">Conventional</option>
            <option value="Mixed">Mixed</option>
            <option value="Dairy">Dairy</option>
            <option value="Poultry">Poultry</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit Orchard</option>
          </select>
        </div>
      </div>

      {/* Established Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Established Year
        </label>
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={formData.establishedYear}
          onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
        />
      </div>

      {/* Location */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Farm Location
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              placeholder="123 Farm Road"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN/ZIP Code
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>
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