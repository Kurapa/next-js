// src/app/crops/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, Sprout as SproutIcon } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CropCard from "@/components/crops/CropCard";
import CropModal from "@/components/crops/CropModal";
import { useAuth } from "@/app/contexts/AuthContext";
import { cropService, Crop } from "@/lib/db";

export default function CropsPage() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load crops
  useEffect(() => {
    if (user) {
      loadCrops();
    }
  }, [user]);

  // Filter crops
  useEffect(() => {
    let filtered = crops;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (crop) =>
          crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          crop.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((crop) => crop.status === filterStatus);
    }

    setFilteredCrops(filtered);
  }, [crops, searchQuery, filterStatus]);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const userCrops = await cropService.getUserCrops(user!.uid);
      setCrops(userCrops);
      setFilteredCrops(userCrops);
    } catch (error) {
      console.error("Error loading crops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = async (cropData: Partial<Crop>) => {
    try {
      if (selectedCrop) {
        // Update existing crop
        await cropService.update(selectedCrop.id!, cropData);
      } else {
        // Create new crop
        await cropService.create(cropData as Omit<Crop, "id" | "createdAt" | "updatedAt">);
      }
      await loadCrops();
      setIsModalOpen(false);
      setSelectedCrop(null);
    } catch (error) {
      console.error("Error saving crop:", error);
    }
  };

  const handleEditCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDeleteCrop = async (id: string) => {
    if (confirm("Are you sure you want to delete this crop?")) {
      try {
        await cropService.delete(id);
        await loadCrops();
      } catch (error) {
        console.error("Error deleting crop:", error);
      }
    }
  };

  const handleAddNew = () => {
    setSelectedCrop(null);
    setIsModalOpen(true);
  };

  const stats = {
    total: crops.length,
    planted: crops.filter((c) => c.status === "planted").length,
    growing: crops.filter((c) => c.status === "growing").length,
    harvesting: crops.filter((c) => c.status === "harvesting").length,
    harvested: crops.filter((c) => c.status === "harvested").length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Crops 🌾</h1>
              <p className="text-gray-600">Manage and track all your crops in one place</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Crop
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Planted</p>
              <p className="text-2xl font-bold text-blue-700">{stats.planted}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-600 mb-1">Growing</p>
              <p className="text-2xl font-bold text-green-700">{stats.growing}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-600 mb-1">Harvesting</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.harvesting}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Harvested</p>
              <p className="text-2xl font-bold text-gray-700">{stats.harvested}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops by name, type, or field..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-11 pr-8 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white min-w-[200px]"
            >
              <option value="all">All Status</option>
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="harvesting">Harvesting</option>
              <option value="harvested">Harvested</option>
            </select>
          </div>
        </div>

        {/* Crops Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your crops...</p>
            </div>
          </div>
        ) : filteredCrops.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
              <SproutIcon className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No crops found"
                : "No crops yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter"
                : "Start by adding your first crop"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Your First Crop
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onEdit={handleEditCrop}
                onDelete={handleDeleteCrop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <CropModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCrop(null);
        }}
        onSave={handleSaveCrop}
        crop={selectedCrop}
        userId={user!.uid}
      />
    </DashboardLayout>
  );
}