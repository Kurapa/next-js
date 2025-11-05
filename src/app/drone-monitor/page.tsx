// src/app/drone-monitor/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plane, RefreshCw, Loader2, FolderOpen, Scan, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DroneImageCard from "@/components/drone/DroneImageCard";
import DiseaseReportModal from "@/components/drone/DiseaseReportModal";
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchDroneImages, getMockDroneImages, DriveImage } from "@/lib/googleDrive";
import { analyzeImage, DiseaseResult, getMockDiseaseResult } from "@/lib/diseaseDetection";

export default function DroneMonitorPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Map<string, DiseaseResult>>(new Map());
  const [selectedResult, setSelectedResult] = useState<{ result: DiseaseResult; image: DriveImage } | null>(null);
  const [stats, setStats] = useState({
    totalImages: 0,
    analyzed: 0,
    diseaseFound: 0,
    healthy: 0,
  });

  useEffect(() => {
    loadDroneImages();
  }, []);

  useEffect(() => {
    updateStats();
  }, [results, images]);

  const loadDroneImages = async () => {
    try {
      setLoading(true);
      // Try to fetch from Google Drive, fallback to mock data
      const driveImages = await fetchDroneImages();
      console.log(driveImages)
      const imagesToUse = driveImages.length > 0 ? driveImages : getMockDroneImages();
      setImages(imagesToUse);
    } catch (error) {
      console.error("Error loading images:", error);
      setImages(getMockDroneImages());
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (imageId: string) => {
    try {
      setAnalyzing(imageId);
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Simulate API call - replace with actual backend call
      //await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await analyzeImage(image.thumbnailLink)
      
      setResults(prev => new Map(prev).set(imageId, result));
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleBatchAnalyze = async () => {
    for (const image of images) {
      if (!results.has(image.id)) {
        await handleAnalyze(image.id);
      }
    }
  };

  const updateStats = () => {
    const analyzed = results.size;
    const diseaseFound = Array.from(results.values()).filter(r => !(r.disease.toLowerCase().includes('healthy'))).length;
    const healthy = Array.from(results.values()).filter(r => r.disease.toLowerCase().includes('healthy')).length;

    setStats({
      totalImages: images.length,
      analyzed,
      diseaseFound,
      healthy,
    });
  };

  const handleViewReport = (imageId: string) => {
    const result = results.get(imageId);
    const image = images.find(img => img.id === imageId);
    if (result && image) {
      setSelectedResult({ result, image });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl">
                  <Plane className="w-8 h-8 text-white" />
                </div>
                Drone Monitor
              </h1>
              <p className="text-gray-600">Automated crop health monitoring from aerial imagery</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadDroneImages}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleBatchAnalyze}
                disabled={analyzing !== null || images.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50"
              >
                <Scan className="w-5 h-5" />
                Analyze All
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <FolderOpen className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.totalImages}</span>
              </div>
              <p className="text-blue-100">Total Images</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Scan className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.analyzed}</span>
              </div>
              <p className="text-purple-100">Analyzed</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.diseaseFound}</span>
              </div>
              <p className="text-red-100">Disease Found</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.healthy}</span>
              </div>
              <p className="text-green-100">Healthy</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Drone Captures", desc: "Drone takes aerial photos of your fields" },
              { step: "2", title: "Auto Upload", desc: "Images uploaded to Google Drive folder" },
              { step: "3", title: "AI Analysis", desc: "Our AI detects diseases automatically" },
              { step: "4", title: "Get Results", desc: "Receive detailed reports and recommendations" },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading drone images...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Images Found</h3>
            <p className="text-gray-600 mb-6">
              Upload images to your Google Drive folder or check your configuration
            </p>
            <button
              onClick={loadDroneImages}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all"
            >
              Refresh Images
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <DroneImageCard
                key={image.id}
                image={image}
                onAnalyze={handleAnalyze}
                analyzing={analyzing === image.id}
                result={results.get(image.id)}
              />
            ))}
          </div>
        )}

        {/* Setup Instructions (when no API configured) */}
        {images.length > 0 && images[0].id === '1' && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="font-bold text-lg text-yellow-900 mb-2">🔧 Setup Required</h3>
            <p className="text-yellow-800 mb-4">
              You're viewing demo images. To connect your Google Drive:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800">
              <li>Enable Google Drive API in Google Cloud Console</li>
              <li>Get your API key and add to <code className="bg-yellow-200 px-2 py-1 rounded">.env.local</code></li>
              <li>Set your drone folder ID</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>

      {/* Disease Report Modal */}
      {selectedResult && (
        <DiseaseReportModal
          isOpen={true}
          onClose={() => setSelectedResult(null)}
          result={selectedResult.result}
          imageSrc={selectedResult.image.thumbnailLink}
        />
      )}
    </DashboardLayout>
  );
}