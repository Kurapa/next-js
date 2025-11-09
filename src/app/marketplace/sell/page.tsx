// src/app/marketplace/sell/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Upload, X, Loader2, Check, Package, Edit2, Trash2,
  Eye, MapPin, Calendar, AlertCircle, CheckCircle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";

interface CropListing {
  id?: string;
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

export default function SellCropsPage() {
  const {user} = useAuth();
  const [myListings, setMyListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState<Partial<CropListing>>({
    cropName: "",
    category: "vegetables",
    quantity: "",
    unit: "kg",
    priceRange: "",
    description: "",
    images: [],
    harvestDate: "",
    organic: false,
    status: "available",
  });

  const categories = ["vegetables", "fruits", "grains", "legumes", "herbs", "other"];
  const units = ["kg", "tons", "quintal", "bags", "pieces", "bundles"];

  useEffect(() => {
    if (user) {
      loadMyListings();
    }
  }, [user]);

  const loadMyListings = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "cropListings"),
        where("sellerId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const listings: CropListing[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        listings.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as CropListing);
      });

      setMyListings(listings);
    } catch (error) {
      console.error("Error loading listings:", error);
      showMessage("error", "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload to Firebase Storage
    // For now, we'll use placeholder URLs
    const imageUrls: string[] = [];
    
    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageUrls.push(reader.result as string);
        if (imageUrls.length === files.length) {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...imageUrls]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showMessage("error", "You must be logged in to create a listing");
      return;
    }

    if (!formData.cropName || !formData.quantity || !formData.priceRange) {
      showMessage("error", "Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const listingData: Partial<CropListing> = {
        ...formData,
        sellerId: user.uid,
        sellerName: user?.displayName || user.displayName || "Anonymous",
        sellerEmail: user.email || "",
        sellerPhone: user?.phoneNumber||"",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "cropListings"), {
        ...listingData,
        createdAt: Timestamp.now(),
      });

      showMessage("success", "Listing created successfully!");
      setShowForm(false);
      resetForm();
      await loadMyListings();
    } catch (error: any) {
      console.error("Error creating listing:", error);
      showMessage("error", error.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await deleteDoc(doc(db, "cropListings", listingId));
      showMessage("success", "Listing deleted successfully!");
      await loadMyListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      showMessage("error", "Failed to delete listing");
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "cropListings", listingId), {
        status: newStatus,
      });
      showMessage("success", "Status updated successfully!");
      await loadMyListings();
    } catch (error) {
      console.error("Error updating status:", error);
      showMessage("error", "Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      cropName: "",
      category: "vegetables",
      quantity: "",
      unit: "kg",
      priceRange: "",
      description: "",
      images: [],
      harvestDate: "",
      organic: false,
      status: "available",
    });
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              Sell Your Crops
            </h1>
            <p className="text-gray-600">Manage your crop listings and connect with buyers</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Listing
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center gap-3 ${
            message.type === "success" 
              ? "bg-green-50 border-2 border-green-200 text-green-800" 
              : "bg-red-50 border-2 border-red-200 text-red-800"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium flex-1">{message.text}</p>
            <button onClick={() => setMessage(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* My Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your listings...</p>
            </div>
          </div>
        ) : myListings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Listings Yet</h3>
            <p className="text-gray-600 mb-6">Create your first listing to start selling</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.cropName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-blue-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <select
                      value={listing.status}
                      onChange={(e) => handleStatusChange(listing.id!, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                        listing.status === 'available' 
                          ? 'bg-green-500 text-white border-green-600'
                          : listing.status === 'reserved'
                          ? 'bg-yellow-500 text-white border-yellow-600'
                          : 'bg-red-500 text-white border-red-600'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.cropName}</h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-600">
                      {listing.quantity} {listing.unit}
                    </div>
                    <div className="text-blue-600 font-bold">
                      {listing.priceRange}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>0 views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{listing.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(listing.id!)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Listing Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold">Create New Listing</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Crop Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    placeholder="e.g., Fresh Tomatoes"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Category and Organic */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organic?
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.organic}
                        onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-700">Yes, it's organic</span>
                    </label>
                  </div>
                </div>

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="e.g., 100"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    placeholder="e.g., ₹50-70 per kg"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide a price range for negotiation</p>
                </div>

                {/* Harvest Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your crop, quality, special features..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Images
                  </label>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                        <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Notice */}
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-1">Important Reminder</p>
                      <p className="text-sm text-yellow-800">
                        Buyers will contact you directly. All payments are conducted in person at your farm location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Create Listing
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}