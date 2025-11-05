// src/components/dashboard/WeatherCard.tsx
"use client";

import { useState, useEffect } from "react";
import { RefreshCw, MapPin, Droplets, Wind, Sun, Loader2, CloudRain } from "lucide-react";
import { getCurrentWeather, WeatherData } from "@/lib/weather";

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const weatherData = await getCurrentWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error("Error loading weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
    setTimeout(() => setRefreshing(false), 500);
  };

  const getWeatherGradient = () => {
    if (!weather) return "from-blue-500 to-cyan-500";
    
    const condition = weather.condition.toLowerCase();
    if (condition.includes("clear") || condition.includes("sunny")) {
      return "from-orange-400 via-yellow-400 to-amber-500";
    } else if (condition.includes("cloud")) {
      return "from-slate-400 via-gray-400 to-zinc-500";
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return "from-blue-600 via-indigo-500 to-blue-700";
    } else if (condition.includes("thunder") || condition.includes("storm")) {
      return "from-purple-600 via-indigo-700 to-slate-800";
    } else if (condition.includes("snow")) {
      return "from-cyan-300 via-blue-200 to-indigo-300";
    }
    return "from-blue-500 to-cyan-500";
  };

  const getAdvice = () => {
    if (!weather) return "Perfect conditions for farming";
    
    if (weather.temperature > 35) return "⚠️ Very hot! Ensure adequate irrigation";
    if (weather.temperature < 10) return "🥶 Cold weather - protect sensitive crops";
    if (weather.rainChance > 70) return "🌧️ High rain probability - plan indoor tasks";
    if (weather.uvIndex > 8) return "☀️ High UV - take precautions in field";
    if (weather.windSpeed > 30) return "💨 Windy conditions - secure equipment";
    
    return "✅ Perfect conditions for farming";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
            <p className="text-white/80">Loading weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-3xl p-8 text-white animate-fade-in">
        <div className="text-center py-8">
          <CloudRain className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <p className="text-white/80">Unable to load weather data</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br ${getWeatherGradient()} rounded-3xl p-8 text-white overflow-hidden animate-fade-in shadow-2xl`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }}></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "1s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="text-white/90 text-sm font-medium">Your Location</span>
            </div>
            <h3 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <span className="text-6xl animate-float">{weather.icon}</span>
              <span>Today's Weather</span>
            </h3>
            <p className="text-white/80 text-sm">{getAdvice()}</p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm hover:scale-110 disabled:opacity-50"
            title="Refresh Weather"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Weather Display */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Temperature */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-white/70 text-sm mb-2">Temperature</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold animate-pulse">{weather.temperature}°</span>
              <span className="text-3xl font-light">C</span>
            </div>
            <p className="text-white/80 mt-2 font-medium">{weather.condition}</p>
          </div>

          {/* Feels Like / Status */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-white/70 text-sm mb-2">Conditions</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Status</span>
                <span className="font-semibold">
                  {weather.temperature > 30 ? "🔥 Hot" : weather.temperature < 15 ? "❄️ Cold" : "😊 Pleasant"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Farming</span>
                <span className="font-semibold">
                  {weather.rainChance < 30 ? "✅ Ideal" : weather.rainChance < 70 ? "⚠️ Moderate" : "❌ Not Ideal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { 
              icon: <Droplets className="w-6 h-6" />, 
              label: "Humidity", 
              value: `${weather.humidity}%`,
              color: "from-blue-400 to-cyan-400"
            },
            { 
              icon: <Wind className="w-6 h-6" />, 
              label: "Wind", 
              value: `${weather.windSpeed} km/h`,
              color: "from-teal-400 to-emerald-400"
            },
            { 
              icon: <CloudRain className="w-6 h-6" />, 
              label: "Rain", 
              value: `${weather.rainChance}%`,
              color: "from-indigo-400 to-blue-400"
            },
            { 
              icon: <Sun className="w-6 h-6" />, 
              label: "UV Index", 
              value: weather.uvIndex.toString(),
              color: "from-orange-400 to-yellow-400"
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/25 transition-all hover:scale-105 group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={`inline-flex p-2 bg-gradient-to-br ${item.color} rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <p className="text-white/70 text-xs mb-1">{item.label}</p>
              <p className="font-bold text-xl">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Bottom Info Bar */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-sm text-white/80">Live weather data</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Last updated</p>
            <p className="text-sm font-medium">Just now</p>
          </div>
        </div>
      </div>

      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}