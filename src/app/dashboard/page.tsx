// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Loader2, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WeatherCard from "@/components/dashboard/WeatherCard";
import { cropService, taskService, activityService, getTimeBasedGreeting, getGreetingEmoji } from "@/lib/db";
import { 
  Activity, 
  Droplets, 
  Sprout, 
  ShieldAlert, 
  Package, 
  Leaf, 
  MapPin, 
  Clock,
  DollarSign 
} from 'lucide-react';


export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  // State for dynamic data
  const [stats, setStats] = useState({
    totalCrops: 0,
    activeFields: 0,
    revenue: "$0",
    pendingTasks: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      loadDashboardData();
    }
  }, [user, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load crops
      const crops = await cropService.getUserCrops(user.uid);
      const activeCrops = crops.filter(c => c.status === 'growing' || c.status === 'planted').length;

      // Load tasks
      const tasks = await taskService.getUserTasks(user.uid);
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

      // Load activities
      const activities = await activityService.getUserActivities(user.uid);
      const recentActivities = activities.slice(0, 4);

      // Calculate unique fields
      const uniqueFields = new Set(crops.map(c => c.fieldName));

      // Calculate revenue (sum of crop areas * estimated value)
      const estimatedRevenue = crops.reduce((sum, crop) => {
        if (crop.status === 'harvested') {
          return sum + (crop.area * 5000); // $5000 per acre (example)
        }
        return sum;
      }, 0);

      setStats({
        totalCrops: crops.length,
        activeFields: uniqueFields.size,
        revenue: `$${estimatedRevenue.toLocaleString()}`,
        pendingTasks: pendingTasks,
      });

      setRecentActivities(recentActivities);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  const greeting = getTimeBasedGreeting();
  const greetingEmoji = getGreetingEmoji();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Welcome Section with Time-based Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            {greeting}, {user?.displayName || "Farmer"}! {greetingEmoji}
          </h1>
          <p className="text-gray-600">Here's what's happening on your farm today.</p>
        </div>

        {/* Stats Grid - Dynamic Data */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            {[
              { 
                label: "Total Crops", 
                value: stats.totalCrops, 
                change: `${stats.totalCrops > 0 ? 'Active' : 'Get started'}`, 
                color: "emerald" 
              },
              { 
                label: "Active Fields", 
                value: stats.activeFields, 
                change: `${stats.activeFields} in use`, 
                color: "green" 
              },
              { 
                label: "Revenue", 
                value: stats.revenue, 
                change: "Estimated value", 
                color: "teal" 
              },
              { 
                label: "Tasks Pending", 
                value: stats.pendingTasks, 
                change: stats.pendingTasks > 0 ? `${stats.pendingTasks} need attention` : 'All done!', 
                color: "amber" 
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-emerald-600 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Activity - Dynamic Data */}
          {/* <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activities</p>
                <p className="text-sm text-gray-400 mt-1">Start by adding crops or tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={activity.id || idx}
                    className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : activity.description}
                      </p>
                      <p className="text-sm text-gray-500">{activity.fieldName || activity.cropName}</p>
                    </div>
                    <span className="text-sm text-gray-400">{getTimeAgo(activity.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div> */}
<div className="lg:col-span-2 bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50 shadow-lg animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
      </div>
      <button
        onClick={loadDashboardData}
        className="p-2 hover:bg-emerald-100 rounded-xl transition-all hover:scale-110 active:scale-95 group"
        title="Refresh"
      >
        <RefreshCw className="w-4 h-4 text-emerald-600 group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
    
    {loading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-emerald-200 rounded-full animate-ping"></div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Loading activities...</p>
      </div>
    ) : recentActivities.length === 0 ? (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="text-gray-600 font-medium mb-2">No recent activities</p>
        <p className="text-sm text-gray-400">Start by adding crops or tasks to see your activity here</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
        {recentActivities.map((activity, idx) => {
          const activityIcons: Record<string, any> = {
            watering: Droplets,
            fertilizing: Sprout,
            pesticide: ShieldAlert,
            harvest: Package,
            planting: Leaf,
            other: Activity,
          };
          
          const activityColors: Record<string, string> = {
            watering: 'from-blue-500 to-cyan-600',
            fertilizing: 'from-green-500 to-emerald-600',
            pesticide: 'from-orange-500 to-red-600',
            harvest: 'from-yellow-500 to-orange-600',
            planting: 'from-emerald-500 to-green-600',
            other: 'from-gray-500 to-slate-600',
          };

          const Icon = activityIcons[activity.type || 'other'] || Activity;
          const colorGradient = activityColors[activity.type || 'other'];

          return (
            <div
              key={activity.id || idx}
              className="group relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/50 to-emerald-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon */}
              <div className={`relative z-10 p-3 bg-gradient-to-br ${colorGradient} rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 relative z-10 min-w-0">
                <p className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors truncate">
                  {activity.type ? activity.type.charAt(0).toUpperCase() + activity.type.slice(1) : activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {activity.fieldName || activity.cropName || 'Unknown'}
                  </span>
                  {activity.cost && (
                    <span className="inline-flex items-center gap-1 text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg font-medium">
                      <DollarSign className="w-3 h-3" />
                      {activity.cost}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Timestamp */}
              <div className="relative z-10 flex flex-col items-end">
                <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(activity.createdAt)}
                </span>
              </div>
              
              {/* Subtle animation indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-green-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
            </div>
          );
        })}
      </div>
    )}
</div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: "Add New Crop", icon: "🌾", href: "/crops" },
                { label: "Disease Check", icon: "🔬", href: "/disease-detection" },
                { label: "Marketplace", icon: "🛒", href: "/marketplace" },
                { label: "Pesticides", icon: "🧴", href: "/marketplace/pesticides" },
                { label: "Buy crops", icon: "🛒🌾", href: "/marketplace/buy" },
              ].map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl transition-all text-left font-medium text-gray-700 hover:shadow-md"
                >
                  <span className="text-2xl">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Widget - Enhanced Component */}
        <WeatherCard />
      </div>
    </DashboardLayout>
  );
}