// src/app/marketplace/fertilizers/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, ShoppingCart, Leaf, TrendingUp, 
  Package, Phone, Mail, Star, Info, X, AlertCircle, 
  CheckCircle, Loader2, Sprout, Award, Droplets, Zap
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";

interface Fertilizer {
  id: string;
  name: string;
  brand: string;
  type: string; // NPK, Organic, Micronutrient, etc.
  category: string; // For crops, For soil, etc.
  composition: string;
  npkRatio?: string; // e.g., "10:26:26"
  targetCrops: string[];
  benefits: string[];
  dosage: string;
  applicationMethod: string;
  pricePerUnit: number;
  unit: string; // kg, bag, liter
  packSize: string;
  availability: string;
  location: string;
  organic: boolean;
  certified: boolean;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  supplier: {
    name: string;
    phone?: string;
    email: string;
    verified: boolean;
  };
}

export default function FertilizersPage() {
  const { user } = useAuth();
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
  const [filteredFertilizers, setFilteredFertilizers] = useState<Fertilizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [selectedFertilizer, setSelectedFertilizer] = useState<Fertilizer | null>(null);

  const types = ["all", "NPK", "Organic", "Micronutrient", "Biofertilizer", "Liquid", "Other"];
  const crops = ["all", "rice", "wheat", "cotton", "vegetables", "fruits", "sugarcane", "pulses"];

  useEffect(() => {
    loadFertilizers();
  }, []);

  useEffect(() => {
    filterFertilizers();
  }, [searchTerm, selectedType, selectedCrop, organicOnly, fertilizers]);

  const loadFertilizers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "fertilizers"),
        orderBy("name", "asc")
      );

      const querySnapshot = await getDocs(q);
      const fertilizersData: Fertilizer[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fertilizersData.push({
          id: doc.id,
          ...data,
          targetCrops: data.targetCrops || [],
          benefits: data.benefits || [],
          certifications: data.certifications || [],
        } as Fertilizer);
      });

      setFertilizers(fertilizersData);
    } catch (error) {
      console.error("Error loading fertilizers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFertilizers = () => {
    let filtered = [...fertilizers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.targetCrops.some(crop => crop.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(item =>
        item.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Crop filter
    if (selectedCrop !== "all") {
      filtered = filtered.filter(item =>
        item.targetCrops.some(crop => crop.toLowerCase().includes(selectedCrop.toLowerCase()))
      );
    }

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter(item => item.organic);
    }

    setFilteredFertilizers(filtered);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Fertilizers Marketplace</h1>
              <p className="text-gray-600">Crop-specific fertilizers with real-time pricing</p>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
              <Leaf className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{fertilizers.filter(f => f.organic).length}</p>
              <p className="text-sm text-green-100">Organic Options</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
              <Award className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{fertilizers.filter(f => f.certified).length}</p>
              <p className="text-sm text-blue-100">Certified Products</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white">
              <Package className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{fertilizers.length}</p>
              <p className="text-sm text-purple-100">Total Products</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 text-white">
              <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">Live</p>
              <p className="text-sm text-orange-100">Price Updates</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fertilizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none appearance-none bg-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Filter */}
            <div className="relative">
              <Sprout className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none appearance-none bg-white"
              >
                {crops.map(crop => (
                  <option key={crop} value={crop}>
                    {crop === "all" ? "All Crops" : crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Organic Toggle */}
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-yellow-500 transition-all bg-white">
              <input
                type="checkbox"
                checked={organicOnly}
                onChange={(e) => setOrganicOnly(e.target.checked)}
                className="w-5 h-5 text-yellow-600 rounded"
              />
              <span className="text-gray-700 font-medium">🌱 Organic Only</span>
            </label>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <strong>{filteredFertilizers.length}</strong> fertilizer(s)
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading fertilizers...</p>
            </div>
          </div>
        ) : filteredFertilizers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Fertilizers Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFertilizers.map((fertilizer) => (
              <div
                key={fertilizer.id}
                onClick={() => setSelectedFertilizer(fertilizer)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-yellow-300 overflow-hidden cursor-pointer"
              >
                {/* Header */}
                <div className={`p-6 ${
                  fertilizer.organic 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-br from-yellow-400 to-amber-500'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      {fertilizer.organic && (
                        <span className="px-3 py-1 bg-white/90 text-green-700 text-xs font-bold rounded-full">
                          🌱 Organic
                        </span>
                      )}
                      {fertilizer.certified && (
                        <span className="px-3 py-1 bg-white/90 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Certified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{fertilizer.name}</h3>
                  <p className="text-white/80 text-sm">{fertilizer.brand}</p>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Type & NPK */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {fertilizer.type}
                    </span>
                    {fertilizer.npkRatio && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        NPK: {fertilizer.npkRatio}
                      </span>
                    )}
                  </div>

                  {/* Composition */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {fertilizer.composition}
                  </p>

                  {/* Target Crops */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">For Crops:</p>
                    <div className="flex flex-wrap gap-1">
                      {fertilizer.targetCrops.slice(0, 3).map((crop, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {crop}
                        </span>
                      ))}
                      {fertilizer.targetCrops.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{fertilizer.targetCrops.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        ₹{fertilizer.pricePerUnit}
                      </p>
                      <p className="text-xs text-gray-500">per {fertilizer.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{fertilizer.packSize}</p>
                      <p className="text-xs text-gray-500">Pack Size</p>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{fertilizer.location}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      fertilizer.availability === 'In Stock'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {fertilizer.availability}
                    </span>
                  </div>

                  {/* Rating */}
                  {fertilizer.rating && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < fertilizer.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span>({fertilizer.reviewCount || 0})</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 group-hover:scale-105"
                  >
                    <Info className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedFertilizer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-8 py-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sprout className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFertilizer.name}</h2>
                    <p className="text-yellow-100">{selectedFertilizer.brand}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFertilizer(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {/* Key Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border-2 border-yellow-200">
                    <Package className="w-6 h-6 text-yellow-600 mb-2" />
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-bold text-gray-900">{selectedFertilizer.type}</p>
                  </div>
                  
                  {selectedFertilizer.npkRatio && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                      <Zap className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="text-sm text-gray-600">NPK Ratio</p>
                      <p className="font-bold text-gray-900">{selectedFertilizer.npkRatio}</p>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                    <Droplets className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">Dosage</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedFertilizer.dosage}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">Pack Size</p>
                    <p className="font-bold text-gray-900">{selectedFertilizer.packSize}</p>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price per {selectedFertilizer.unit}</p>
                      <p className="text-4xl font-bold text-yellow-600">
                        ₹{selectedFertilizer.pricePerUnit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        selectedFertilizer.availability === 'In Stock'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {selectedFertilizer.availability}
                      </span>
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1 justify-end">
                        <MapPin className="w-4 h-4" />
                        {selectedFertilizer.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Composition
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedFertilizer.composition}</p>
                </div>

                {/* Target Crops */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    Suitable for Crops
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFertilizer.targetCrops.map((crop, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white border-2 border-green-300 text-green-700 rounded-xl font-semibold">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                {selectedFertilizer.benefits && selectedFertilizer.benefits.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      Key Benefits
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedFertilizer.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                          <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Method */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-orange-600" />
                    Application Method
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedFertilizer.applicationMethod}</p>
                  <div className="mt-4 bg-white/60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Recommended Dosage:</p>
                    <p className="text-gray-900 font-bold">{selectedFertilizer.dosage}</p>
                  </div>
                </div>

                {/* Certifications */}
                {selectedFertilizer.certifications && selectedFertilizer.certifications.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFertilizer.certifications.map((cert, idx) => (
                        <span key={idx} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplier Info */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                    Supplier Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600">
                          {selectedFertilizer.supplier.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedFertilizer.supplier.name}</p>
                        {selectedFertilizer.supplier.verified && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            ✓ Verified Supplier
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedFertilizer.supplier.phone && (
                      <a
                        href={`tel:${selectedFertilizer.supplier.phone}`}
                        className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span>{selectedFertilizer.supplier.phone}</span>
                      </a>
                    )}

                    <a
                      href={`mailto:${selectedFertilizer.supplier.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{selectedFertilizer.supplier.email}</span>
                    </a>
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">Purchase Information</p>
                      <p className="text-sm text-yellow-800">
                        Contact the supplier directly for orders and delivery. Prices may vary based on location and quantity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedFertilizer.supplier.phone && (
                    <a
                      href={`tel:${selectedFertilizer.supplier.phone}`}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Call Supplier
                    </a>
                  )}
                  <a
                    href={`mailto:${selectedFertilizer.supplier.email}`}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Email Supplier
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Info className="w-7 h-7 text-indigo-600" />
            Why Choose Our Fertilizers?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Certified Quality</h3>
              <p className="text-gray-600 text-sm">
                All products are tested and certified by authorized agricultural bodies
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Live Pricing</h3>
              <p className="text-gray-600 text-sm">
                Real-time price updates based on your location and market conditions
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-indigo-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Organic Options</h3>
              <p className="text-gray-600 text-sm">
                Wide range of organic and eco-friendly fertilizers for sustainable farming
              </p>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Sprout className="w-7 h-7 text-yellow-600" />
            How to Use This Page
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Search & Filter",
                desc: "Use filters to find the right fertilizer for your crops",
                icon: Search
              },
              {
                step: "2",
                title: "Compare Products",
                desc: "Check NPK ratios, composition, and prices",
                icon: TrendingUp
              },
              {
                step: "3",
                title: "View Details",
                desc: "Click on any product to see complete information",
                icon: Info
              },
              {
                step: "4",
                title: "Contact Supplier",
                desc: "Call or email supplier directly to place order",
                icon: Phone
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-xl p-5 border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
                    {item.step}
                  </div>
                  <Icon className="w-6 h-6 text-yellow-600 mb-2" />
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}