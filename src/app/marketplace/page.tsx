// src/app/marketplace/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Package, ArrowRight, Info, Sprout, 
  Store, Users, TrendingUp, CheckCircle, AlertCircle ,Droplets
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/app/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function MarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, [user]);

  const loadUserRole = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role || 'buyer';
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error loading user role:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            Crop Marketplace
          </h1>
          <p className="text-gray-600">Direct farm-to-buyer connection for fresh agricultural products</p>
        </div>

        {/* Payment Notice */}
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-400 rounded-xl">
              <AlertCircle className="w-6 h-6 text-yellow-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-900 mb-2">Important Notice</h3>
              <p className="text-yellow-800 leading-relaxed">
                <strong>All transactions and payments are conducted in person.</strong> This platform facilitates 
                connections between buyers and sellers. After expressing interest, you'll coordinate directly with 
                the other party to arrange viewing, pricing negotiation, and payment at the farm location.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Sprout className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-green-900">Fresh Products</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">100+</p>
            <p className="text-sm text-green-700">Available crops</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-blue-900">Active Farmers</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">50+</p>
            <p className="text-sm text-blue-700">Verified sellers</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-purple-900">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">95%</p>
            <p className="text-sm text-purple-700">Completed deals</p>
          </div>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buy Crops Card */}
          <div className="group relative bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden hover:scale-105">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-semibold">Fresh</span>
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-4">Buy Crops</h2>
              
              {/* Description */}
              <p className="text-green-50 text-lg mb-6 leading-relaxed">
                Browse fresh crops from local farmers. Direct farm-to-buyer connection.
              </p>

              {/* Info Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <p className="text-white text-sm">
                    Transactions happen at the farm. Meet the seller, inspect the crops, and 
                    negotiate the price in person.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Browse verified listings</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Contact sellers directly</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Inspect before purchase</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => router.push('/marketplace/buy')}
                className="w-full bg-white text-green-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Explore Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Sell Your Crops Card */}
          <div className="group relative bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-600 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden hover:scale-105">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-semibold">List Free</span>
              </div>

              {/* Icon */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-10 h-10 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold text-white mb-4">Sell Your Crops</h2>
              
              {/* Description */}
              <p className="text-blue-50 text-lg mb-6 leading-relaxed">
                List your produce and connect with buyers in your region.
              </p>

              {/* Info Box */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <p className="text-white text-sm">
                    Create a listing with your crop details. Interested buyers will contact you directly 
                    to arrange purchase and pickup.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload crop photos</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Set your own prices</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span>Direct buyer communication</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => router.push('/marketplace/sell')}
                className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Explore Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Agricultural Products Section */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 rounded-3xl p-8 shadow-xl border-2 border-purple-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Agricultural Products</h2>
              <p className="text-gray-600">Pesticides and fertilizers with live pricing</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Pesticides Card */}
            <div className="group relative bg-gradient-to-br from-red-400 via-orange-500 to-red-600 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                 onClick={() => router.push('/marketplace/pesticides')}>
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 bg-red-200 rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">Live Rates</span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Droplets className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-3">Pesticides</h3>
                
                {/* Description */}
                <p className="text-red-50 text-lg mb-6 leading-relaxed">
                  Disease-specific recommendations with current market rates.
                </p>

                {/* Info Box */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <p className="text-white text-sm">
                      Based on detected diseases from drone monitoring. Prices updated in real-time based on your location.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Disease-specific solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Real-time pricing</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Location-based availability</span>
                  </div>
                </div>

                {/* Button */}
                <div className="w-full bg-white text-red-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group">
                  View Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>

            {/* Fertilizers Card */}
            <div className="group relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                 onClick={() => router.push('/marketplace/fertilizers')}>
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 bg-yellow-200 rounded-full animate-pulse"></span>
                  <span className="text-white text-sm font-semibold">Certified</span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sprout className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white mb-3">Fertilizers</h3>
                
                {/* Description */}
                <p className="text-yellow-50 text-lg mb-6 leading-relaxed">
                  Crop-specific fertilizers with detailed information and pricing.
                </p>

                {/* Info Box */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                    <p className="text-white text-sm">
                      Find the right fertilizer for your crops. Prices vary by location and are updated daily.
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Crop-specific nutrients</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Certified products</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span>Daily price updates</span>
                  </div>
                </div>

                {/* Button */}
                <div className="w-full bg-white text-amber-600 py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group">
                  View Products
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl p-8 border-2 border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Browse Listings",
                description: "Explore available crops from local farmers in your area",
                icon: ShoppingCart,
                color: "from-green-500 to-emerald-600"
              },
              {
                step: "2",
                title: "Contact Seller",
                description: "Connect directly with the farmer to discuss details",
                icon: Users,
                color: "from-blue-500 to-cyan-600"
              },
              {
                step: "3",
                title: "Visit Farm",
                description: "Meet at the farm to inspect crops and negotiate price",
                icon: Sprout,
                color: "from-purple-500 to-pink-600"
              },
              {
                step: "4",
                title: "Complete Deal",
                description: "Complete payment and pickup directly at the location",
                icon: CheckCircle,
                color: "from-orange-500 to-red-600"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-gray-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-2">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role-Based Recommendation */}
        {userRole && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {userRole === 'seller' ? '🌾 You are registered as a Seller' : '🛒 You are registered as a Buyer'}
                </h3>
                <p className="text-indigo-100">
                  {userRole === 'seller' 
                    ? 'Start listing your crops to connect with buyers'
                    : 'Browse available crops from local farmers'}
                </p>
              </div>
              <button
                onClick={() => router.push(userRole === 'seller' ? '/marketplace/sell' : '/marketplace/buy')}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}