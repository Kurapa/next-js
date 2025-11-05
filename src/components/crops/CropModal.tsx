// src/components/crops/CropModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Calendar, MapPin, Loader2 } from "lucide-react";
import { Crop } from "@/lib/db";
import { Timestamp } from "firebase/firestore";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cropData: Partial<Crop>) => Promise<void>;
  crop?: Crop | null;
  userId: string;
}

export default function CropModal({ isOpen, onClose, onSave, crop, userId }: CropModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    fieldName: "",
    plantingDate: "",
    expectedHarvestDate: "",
    status: "planted" as "planted" | "growing" | "harvesting" | "harvested",
    area: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name,
        type: crop.type,
        fieldName: crop.fieldName,
        plantingDate: crop.plantingDate.toDate().toISOString().split("T")[0],
        expectedHarvestDate: crop.expectedHarvestDate.toDate().toISOString().split("T")[0],
        status: crop.status,
        area: crop.area.toString(),
        notes: crop.notes || "",
      });
    } else {
      setFormData({
        name: "",
        type: "",
        fieldName: "",
        plantingDate: "",
        expectedHarvestDate: "",
        status: "planted",
        area: "",
        notes: "",
      });
    }
  }, [crop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cropData: Partial<Crop> = {
        userId,
        name: formData.name,
        type: formData.type,
        fieldName: formData.fieldName,
        plantingDate: Timestamp.fromDate(new Date(formData.plantingDate)),
        expectedHarvestDate: Timestamp.fromDate(new Date(formData.expectedHarvestDate)),
        status: formData.status,
        area: parseFloat(formData.area),
        notes: formData.notes,
      };

      await onSave(cropData);
      onClose();
    } catch (error) {
      console.error("Error saving crop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {crop ? "Edit Crop" : "Add New Crop"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Crop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              placeholder="e.g., Wheat, Rice, Tomatoes"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Crop Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              required
              disabled={isSubmitting}
            >
              <option value="">Select crop type</option>
              <option value="Grain">Grain (Wheat, Rice, Corn)</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Fruit">Fruit</option>
              <option value="Legume">Legume (Beans, Lentils)</option>
              <option value="Oilseed">Oilseed (Sunflower, Soybean)</option>
              <option value="Fiber">Fiber (Cotton, Jute)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Field Name & Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Field Name *
              </label>
              <input
                type="text"
                value={formData.fieldName}
                onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="e.g., North Field, Plot A"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (acres) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                placeholder="0.0"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Planting Date *
              </label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expected Harvest *
              </label>
              <input
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) =>
                  setFormData({ ...formData, expectedHarvestDate: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["planted", "growing", "harvesting", "harvested"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      status: status as typeof formData.status,
                    })
                  }
                  disabled={isSubmitting}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    formData.status === status
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
              rows={4}
              placeholder="Add any additional information about this crop..."
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{crop ? "Update Crop" : "Add Crop"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}