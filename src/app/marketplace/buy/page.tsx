// src/app/marketplace/buy/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Search, Filter, MapPin, Phone, Mail, Calendar, Package,
  Leaf, X, Eye, ShoppingCart, User, Star, AlertCircle, Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CropListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerEmail: string;
  sellerLocation?: string;
  cropName: string;
  category: string;
  quantity: string;
  unit: string;
  priceRange: string;
  description: string;
  images: string[];
  harvestDate?: string;
  organic: boolean;
  status: 'available' | 'sold' | 'reserved';
  createdAt: Date;
}

export default function BuyCropsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<CropListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedListing, setSelectedListing] = useState<CropListing | null>(null);

  const categories = [
    "all", "vegetables", "fruits", "grains", "legumes", "herbs", "other"
  ];

  useEffect(() => {
    if(!user){
        router.push('/')
        return;
    }
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, selectedCategory, listings]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "cropListings"),
        where("status", "==", "available"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const listingsData: CropListing[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        listingsData.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as CropListing);
      }

      setListings(listingsData);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.sellerLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(listing =>
        listing.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredListings(filtered);
  };

  const handleViewDetails = (listing: CropListing) => {
    setSelectedListing(listing);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            Buy Fresh Crops
          </h1>
          <p className="text-gray-600">Browse and purchase crops directly from local farmers</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search crops, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <strong>{filteredListings.length}</strong> listing(s)
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading listings...</p>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Listings Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-green-300 overflow-hidden cursor-pointer"
                onClick={() => handleViewDetails(listing)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.cropName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-green-300" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {listing.organic && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        Organic
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full capitalize">
                      {listing.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.cropName}</h3>
                  
                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">{listing.quantity} {listing.unit}</span>
                    </div>
                    <div className="text-green-600 font-bold">
                      {listing.priceRange}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Seller Info */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{listing.sellerName}</span>
                    </div>
                    {listing.sellerLocation && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{listing.sellerLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Crop Details</h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                {/* Images Gallery */}
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedListing.images.map((img, idx) => (
                      <div key={idx} className="relative h-40 rounded-xl overflow-hidden">
                        <img
                          src={img}
                          alt={`${selectedListing.cropName} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Crop Info */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedListing.cropName}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity Available</p>
                      <p className="text-xl font-bold text-green-600">
                        {selectedListing.quantity} {selectedListing.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Price Range</p>
                      <p className="text-xl font-bold text-green-600">{selectedListing.priceRange}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                      {selectedListing.category}
                    </span>
                    {selectedListing.organic && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        🌱 Organic
                      </span>
                    )}
                  </div>

                  <div className="border-t border-green-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                    <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
                  </div>

                  {selectedListing.harvestDate && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Harvested: {new Date(selectedListing.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Seller Contact Info */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    Seller Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedListing.sellerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedListing.sellerName}</p>
                        <p className="text-sm text-gray-600">Verified Farmer</p>
                      </div>
                    </div>

                    {selectedListing.sellerPhone && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <a href={`tel:${selectedListing.sellerPhone}`} className="hover:text-blue-600 transition-colors">
                          {selectedListing.sellerPhone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <a href={`mailto:${selectedListing.sellerEmail}`} className="hover:text-blue-600 transition-colors">
                        {selectedListing.sellerEmail}
                      </a>
                    </div>

                    {selectedListing.sellerLocation && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span>{selectedListing.sellerLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">Payment Notice</p>
                      <p className="text-sm text-yellow-800">
                        Contact the seller to arrange viewing and payment. All transactions are conducted in person at the farm location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <a
                    href={`tel:${selectedListing.sellerPhone}`}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call Seller
                  </a>
                  <a
                    href={`mailto:${selectedListing.sellerEmail}`}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Email Seller
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}