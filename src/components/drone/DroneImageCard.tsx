// src/components/drone/DroneImageCard.tsx
"use client";

import { useState } from "react";
import { Calendar, FileImage, Scan, Eye, Download, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { DriveImage } from "@/lib/googleDrive";
import { DiseaseResult } from "@/lib/diseaseDetection";
import Image from "next/image";


interface DroneImageCardProps {
  image: DriveImage;
  onAnalyze: (imageId: string) => void;
  analyzing: boolean;
  result?: DiseaseResult;
}

export default function DroneImageCard({ image, onAnalyze, analyzing, result }: DroneImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;

    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
        {/* Image */}
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}
                <Image
                src={image.thumbnailLink}
                alt={image.name}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } group-hover:scale-110`}
                onLoad={() => setImageLoaded(true)}
                />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg transition-all text-gray-800 font-medium"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => onAnalyze(image.id)}
                disabled={analyzing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-all text-white font-medium disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Badge */}
          {result && (
            <div className="absolute top-4 right-4">
              {result.disease.toLowerCase().includes('healthy') ? (
                <div className="bg-green-500 text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Healthy</span>
                </div>
              ) : (
                <div className="bg-red-500 text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Disease Found</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* File Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{image.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(image.createdTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileImage className="w-4 h-4" />
                <span>{(parseInt(image.size) / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {/* Analysis Result */}
          {result && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Detection Result</span>
                {getSeverityBadge(result.severity)}
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disease:</span>
                  <span className="font-semibold text-gray-900">{result.disease}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plant Type:</span>
                  <span className="font-semibold text-gray-900">{result.plantType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <span className="font-semibold text-emerald-600">{result.confidence}%</span>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(true)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700 font-medium text-sm"
              >
                View Full Report
              </button>
            </div>
          )}

          {/* Action Buttons (when no result) */}
          {!result && !analyzing && (
            <button
              onClick={() => onAnalyze(image.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl transition-all text-white font-semibold shadow-lg"
            >
              <Scan className="w-5 h-5" />
              Analyze for Disease
            </button>
          )}

          {analyzing && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 rounded-xl">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              <span className="text-emerald-700 font-medium">Analyzing image...</span>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPreview(false)}></div>
          <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-all z-10"
            >
              ✕
            </button>

            <img src={image.thumbnailLink} alt={image.name} className="w-full h-auto" />

            {result && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Disease Analysis Report</h2>
                {/* Full report content would go here */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{result.disease}</h3>
                    <p className="text-gray-700">{result.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}