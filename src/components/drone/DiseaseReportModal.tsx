// src/components/drone/DiseaseReportModal.tsx
"use client";

import { X, AlertTriangle, CheckCircle, Leaf, Droplets, ShieldCheck, TrendingDown, Package } from "lucide-react";
import { DiseaseResult, getSeverityColor } from "@/lib/diseaseDetection";

interface DiseaseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DiseaseResult;
  imageSrc: string;
}

export default function DiseaseReportModal({ isOpen, onClose, result, imageSrc }: DiseaseReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className={`${result.disease === 'Healthy' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'} text-white p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {result.disease === 'Healthy' ? (
                <CheckCircle className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
              <div>
                <h2 className="text-3xl font-bold">{result.disease}</h2>
                <p className="text-white/90 mt-1">{result.plantType} - Confidence: {result.confidence}%</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {result.disease !== 'Healthy' && (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div>
                <p className="text-sm text-white/80">Severity Level</p>
                <p className="text-2xl font-bold">{result.severity.toUpperCase()}</p>
              </div>
              <div className="h-12 w-px bg-white/20"></div>
              <div className="flex-1">
                <p className="text-sm text-white/80">Action Required</p>
                <p className="font-semibold">{result.actionRequired}</p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Image and Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img src={imageSrc} alt="Analyzed crop" className="w-full h-auto" />
              </div>

              {/* Overview */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-blue-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{result.description}</p>
                </div>

                {result.affectedArea && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Affected Area:</strong> {result.affectedArea}
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      <strong>Estimated Loss:</strong> {result.estimatedLoss}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {result.disease !== 'Healthy' && (
              <>
                {/* Symptoms */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    Symptoms to Look For
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <p className="text-gray-700">{symptom}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Causes */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    Common Causes
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {result.causes.map((cause, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <p className="text-gray-700">{cause}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Treatment Methods */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    Treatment Methods
                  </h3>

                  <div className="space-y-4">
                    {/* Organic Treatment */}
                    <div className="border border-green-200 rounded-xl p-5 bg-green-50">
                      <h4 className="font-semibold text-lg text-green-800 mb-3 flex items-center gap-2">
                        <Leaf className="w-5 h-5" />
                        Organic Treatment
                      </h4>
                      <ul className="space-y-2">
                        {result.treatment.organic.map((method, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span className="text-gray-700">{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Chemical Treatment */}
                    <div className="border border-blue-200 rounded-xl p-5 bg-blue-50">
                      <h4 className="font-semibold text-lg text-blue-800 mb-3 flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        Chemical Treatment
                      </h4>
                      <ul className="space-y-2">
                        {result.treatment.chemical.map((method, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span className="text-gray-700">{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preventive Measures */}
                    <div className="border border-purple-200 rounded-xl p-5 bg-purple-50">
                      <h4 className="font-semibold text-lg text-purple-800 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        Preventive Measures
                      </h4>
                      <ul className="space-y-2">
                        {result.treatment.preventive.map((method, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span className="text-gray-700">{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recommended Fertilizers */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-6 h-6 text-emerald-600" />
                    Recommended Fertilizers & Treatments
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {result.recommendedFertilizers.map((fertilizer, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg text-gray-900">{fertilizer.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            fertilizer.type === 'organic' ? 'bg-green-100 text-green-700' :
                            fertilizer.type === 'chemical' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {fertilizer.type.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Dosage:</span>
                            <span className="font-medium text-gray-900">{fertilizer.dosage}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-medium text-gray-900">{fertilizer.applicationMethod}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Frequency:</span>
                            <span className="font-medium text-gray-900">{fertilizer.frequency}</span>
                          </div>
                          {fertilizer.price && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Price:</span>
                              <span className="font-semibold text-emerald-600">{fertilizer.price}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Benefits:</p>
                          <ul className="space-y-1">
                            {fertilizer.benefits.map((benefit, bidx) => (
                              <li key={bidx} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-emerald-500">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button className="w-full mt-4 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all font-medium text-sm">
                          Order Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Close Report
              </button>
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg">
                Save to Crop Records
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all">
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}