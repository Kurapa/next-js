// src/components/crops/CropCard.tsx
"use client";

import { Calendar, MapPin, TrendingUp, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Crop } from "@/lib/db";
import { Timestamp } from "firebase/firestore";
import { useState } from "react";

interface CropCardProps {
  crop: Crop;
  onEdit: (crop: Crop) => void;
  onDelete: (id: string) => void;
}

export default function CropCard({ crop, onEdit, onDelete }: CropCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planted":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "growing":
        return "bg-green-100 text-green-700 border-green-200";
      case "harvesting":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "harvested":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilHarvest = () => {
    const today = new Date();
    const harvestDate = crop.expectedHarvestDate.toDate();
    const diffTime = harvestDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilHarvest = getDaysUntilHarvest();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Header Image */}
      <div className="h-48 bg-gradient-to-br from-emerald-400 to-green-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-2">🌾</div>
            <h3 className="text-2xl font-bold">{crop.name}</h3>
          </div>
        </div>

        {/* Menu Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  onEdit(crop);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 text-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Crop
              </button>
              <button
                onClick={() => {
                  onDelete(crop.id!);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Crop
              </button>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
              crop.status
            )}`}
          >
            {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Type */}
        <div>
          <p className="text-sm text-gray-500">Crop Type</p>
          <p className="font-semibold text-gray-900">{crop.type}</p>
        </div>

        {/* Field */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-sm">{crop.fieldName}</span>
        </div>

        {/* Area */}
        <div className="flex items-center justify-between py-3 px-4 bg-emerald-50 rounded-xl">
          <span className="text-sm text-gray-600">Area</span>
          <span className="font-bold text-emerald-700">{crop.area} acres</span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Planted</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(crop.plantingDate)}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Harvest</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(crop.expectedHarvestDate)}
            </p>
          </div>
        </div>

        {/* Days until harvest */}
        {daysUntilHarvest > 0 && crop.status !== "harvested" && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Days until harvest</span>
              <span className="text-lg font-bold text-emerald-600">
                {daysUntilHarvest} days
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    ((new Date().getTime() - crop.plantingDate.toDate().getTime()) /
                      (crop.expectedHarvestDate.toDate().getTime() -
                        crop.plantingDate.toDate().getTime())) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Notes */}
        {crop.notes && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700 line-clamp-2">{crop.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}