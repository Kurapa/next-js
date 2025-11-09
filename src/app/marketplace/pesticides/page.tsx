// src/app/marketplace/pesticides/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Droplets, MapPin, Phone, Loader2, Upload, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getPesticides, Pesticide } from "@/lib/marketplace";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function PesticidesPage() {
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [filteredPesticides, setFilteredPesticides] = useState<Pesticide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Real-time updates from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'pesticides'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        })) as Pesticide[];
        
        console.log('Pesticides updated:', data.length);
        setPesticides(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching pesticides:', error);
        // Fallback to mock data
        loadPesticides();
      }
    );

    return () => unsubscribe();
  }, []);

  const loadPesticides = async () => {
    try {
      setLoading(true);
      const data = await getPesticides();
      setPesticides(data);
    } catch (error) {
      console.error('Error loading pesticides:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter pesticides
  useEffect(() => {
    let filtered = pesticides;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetDisease.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Filter by location
    if (selectedLocation && selectedLocation !== "all") {
      filtered = filtered.filter(p => 
        p.availableLocations.includes(selectedLocation) ||
        p.availableLocations.includes('All India')
      );
    }

    setFilteredPesticides(filtered);
  }, [pesticides, searchQuery, filterType, selectedLocation]);

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      insecticide: 'bg-blue-100 text-blue-700',
      fungicide: 'bg-green-100 text-green-700',
      herbicide: 'bg-yellow-100 text-yellow-700',
      bactericide: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };
  console.log(filteredPesticides)
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Droplets className="w-10 h-10 text-red-600" />
                Pesticides
              </h1>
              <p className="text-gray-600">Disease-specific recommendations with live pricing</p>
            </div>
            
            <button
              onClick={loadPesticides}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Live Update Indicator */}
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 w-fit">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Live pricing • Updates in real-time</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, disease, or brand..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="insecticide">Insecticide</option>
                <option value="fungicide">Fungicide</option>
                <option value="herbicide">Herbicide</option>
                <option value="bactericide">Bactericide</option>
              </select>
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none bg-white"
              >
                <option value="all">all</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          </div>
        ) : filteredPesticides.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Pesticides Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPesticides.map((pesticide) => (
              <div
                key={pesticide.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-red-100 to-orange-100 relative overflow-hidden">
                  {pesticide.imageUrl ? (
                    <img
                      src={pesticide.imageUrl}
                      alt={pesticide.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Droplets className="w-16 h-16 text-red-400" />
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(pesticide.type)}`}>
                      {pesticide.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{pesticide.name}</h3>
                    <p className="text-sm text-gray-600">{pesticide.brand}</p>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-3xl font-bold text-emerald-600">
                          ₹{pesticide.pricePerUnit}
                        </p>
                      </div>
                      <span className="text-gray-600">per {pesticide.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(pesticide.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Target Diseases */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Effective Against:</p>
                    <div className="flex flex-wrap gap-2">
                      {pesticide.targetDisease.slice(0, 3).map((disease, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium"
                        >
                          {disease}
                        </span>
                      ))}
                      {pesticide.targetDisease.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                          +{pesticide.targetDisease.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dosage */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Dosage</p>
                    <p className="text-sm text-blue-900">{pesticide.dosage}</p>
                  </div>

                  {/* Pack Sizes */}
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Available Packs:</p>
                    <div className="flex flex-wrap gap-2">
                      {pesticide.packSizes.map((size, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Locations */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{pesticide.availableLocations.slice(0, 2).join(', ')}</span>
                    {pesticide.availableLocations.length > 2 && (
                      <span className="text-gray-400">+{pesticide.availableLocations.length - 2}</span>
                    )}
                  </div>

                  {/* Contact Button */}
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                    <Phone className="w-5 h-5" />
                    Contact Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}