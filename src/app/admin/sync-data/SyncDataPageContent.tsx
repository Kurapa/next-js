"use client";

import { useState } from "react";
import {
  Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle,
  Loader2, Trash2, Database, X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { Pesticide } from "@/lib/marketplace";

// ---------------- Interfaces ---------------- //
// interface Pesticide {
//   id?: string;
//   name: string;
//   brand: string;
//   type: string;
//   targetDisease: string[];
//   composition: string;
//   dosage: string;
//   pricePerUnit: number;
//   unit: string;
//   packSizes: string[];
//   imageUrl: string;
//   description: string;
//   safetyPeriod: string;
//   applicationMethod: string[];
//   availableLocations: string[];
//   lastUpdated: Date;
// }

interface Fertilizer {
  id: string;
  name: string;
  brand: string;
  type: string;
  category: string;
  composition: string;
  npkRatio?: string;
  targetCrops: string[];
  benefits: string[];
  dosage: string;
  applicationMethod: string;
  pricePerUnit: number;
  unit: string;
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

// ----------------------------------------------------------- //

export default function SyncDataPage() {
  const [activeTab, setActiveTab] = useState<"pesticides" | "fertilizers">("pesticides");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });

  // ---------------- Message ---------------- //
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ---------------- File Handling ---------------- //
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      showMessage("error", "Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setFile(selectedFile);
    await parseExcelFile(selectedFile);
  };

  // ---------------- Excel Parsing ---------------- //
  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (activeTab === "pesticides") {
        const parsedData: Pesticide[] = jsonData.map((row: any, index: number) => ({
          id: `excel_${index}_${Date.now()}`,
          name: row.Name || "",
          brand: row.Brand || "",
          type: (row.Type || "insecticide").toLowerCase(),
          targetDisease: (row["Target Disease"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          composition: row.Composition || "",
          dosage: row.Dosage || "",
          pricePerUnit: parseFloat(row["Price Per Unit"] || 0),
          unit: (row.Unit || "liter").toLowerCase(),
          packSizes: (row["Pack Sizes"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          imageUrl: row["Image URL"] || "",
          description: row.Description || "",
          safetyPeriod: row["Safety Period"] || "",
          applicationMethod: (row["Application Method"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          availableLocations: (row["Available Locations"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          lastUpdated: new Date(),
        }));
        setPreview(parsedData);
      } else {
        const parsedData: Fertilizer[] = jsonData.map((row: any, index: number) => ({
          id: `excel_${index}_${Date.now()}`,
          name: row.Name || "",
          brand: row.Brand || "",
          type: row.Type || "",
          category: row.Category || "",
          composition: row.Composition || "",
          npkRatio: row["NPK Ratio"] || "",
          targetCrops: (row["Target Crops"] || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          benefits: (row.Benefits || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          dosage: row.Dosage || "",
          applicationMethod: row["Application Method"] || "",
          pricePerUnit: parseFloat(row["Price Per Unit"] || 0),
          unit: row.Unit || "",
          packSize: row["Pack Size"] || "",
          availability: row.Availability || "",
          location: row.Location || "",
          organic: row.Organic === "TRUE" || row.Organic === true,
          certified: row.Certified === "TRUE" || row.Certified === true,
          certifications: (row.Certifications || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          rating: parseFloat(row.Rating || 0),
          reviewCount: parseInt(row["Review Count"] || 0),
          supplier: {
            name: row["Supplier Name"] || "",
            phone: row["Supplier Phone"] || "",
            email: row["Supplier Email"] || "",
            verified: row["Supplier Verified"] === "TRUE" || row["Supplier Verified"] === true,
          },
        }));
        setPreview(parsedData);
      }

      setShowPreview(true);
      showMessage("success", `Parsed ${jsonData.length} records from Excel`);
    } catch (error: any) {
      console.error(error);
      showMessage("error", "Failed to parse Excel file: " + error.message);
    }
  };

  // ---------------- Upload to Firestore ---------------- //
  const handleUpload = async () => {
    if (preview.length === 0) {
      showMessage("error", "No data to upload");
      return;
    }
    if (!confirm(`Upload ${preview.length} ${activeTab} records to Firestore?`)) return;

    try {
      setUploading(true);
      let successCount = 0;
      const batchSize = 500;

      for (let i = 0; i < preview.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchData = preview.slice(i, i + batchSize);

        batchData.forEach((item) => {
          const docRef = doc(collection(db, activeTab));
          batch.set(docRef, { ...item, lastUpdated: new Date(), lastSyncedFrom: "excel" });
        });

        await batch.commit();
        successCount += batchData.length;
      }

      setStats({ total: preview.length, success: successCount, failed: 0 });
      showMessage("success", `Uploaded ${successCount} ${activeTab} successfully!`);
      setPreview([]);
      setShowPreview(false);
      setFile(null);
    } catch (error: any) {
      console.error(error);
      showMessage("error", "Failed to upload data: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ---------------- Template Download ---------------- //
  const downloadTemplate = () => {
    setDownloadingTemplate(true);

    const sampleData =
      activeTab === "pesticides"
        ? [
            {
              Name: "Chlorpyrifos 20% EC",
              Brand: "Tata Rallis",
              Type: "insecticide",
              "Target Disease": "Aphids, Whiteflies",
              Composition: "Chlorpyrifos 20%",
              Dosage: "2ml per liter",
              "Price Per Unit": 450,
              Unit: "liter",
              "Pack Sizes": "500ml, 1L",
              "Image URL": "https://example.com/image.jpg",
              Description: "Broad-spectrum insecticide",
              "Safety Period": "15 days",
              "Application Method": "Foliar Spray",
              "Available Locations": "Delhi, Mumbai, Pune",
            },
          ]
        : [
            {
              Name: "Urea",
              Brand: "IFFCO",
              Type: "NPK",
              Category: "For Crops",
              Composition: "46% Nitrogen",
              "NPK Ratio": "46:0:0",
              "Target Crops": "Wheat, Rice",
              Benefits: "Promotes leaf growth, Enhances yield",
              Dosage: "50kg per acre",
              "Application Method": "Soil application",
              "Price Per Unit": 500,
              Unit: "bag",
              "Pack Size": "50kg",
              Availability: "Available",
              Location: "India",
              Organic: "FALSE",
              Certified: "TRUE",
              Certifications: "ISO, FCO",
              Rating: 4.5,
              "Review Count": 120,
              "Supplier Name": "IFFCO Limited",
              "Supplier Phone": "9999999999",
              "Supplier Email": "info@iffco.in",
              "Supplier Verified": "TRUE",
            },
          ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `${activeTab}_template.xlsx`);

    setDownloadingTemplate(false);
    showMessage("success", `Downloaded ${activeTab} template!`);
  };

  // ---------------- Export Data ---------------- //
  const exportCurrentData = async () => {
    try {
      setDownloadingTemplate(true);
      const querySnapshot = await getDocs(collection(db, activeTab));
      const data = querySnapshot.docs.map((doc) => doc.data());
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, activeTab);
      XLSX.writeFile(wb, `${activeTab}_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      showMessage("success", `Exported ${data.length} ${activeTab} records!`);
    } catch (error: any) {
      console.error(error);
      showMessage("error", "Export failed: " + error.message);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            Data Sync Center
          </h1>
          <div className="flex gap-3">
            <button
              className={`px-5 py-2 rounded-xl font-semibold ${
                activeTab === "pesticides"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("pesticides")}
            >
              Pesticides
            </button>
            <button
              className={`px-5 py-2 rounded-xl font-semibold ${
                activeTab === "fertilizers"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => setActiveTab("fertilizers")}
            >
              Fertilizers
            </button>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div
            className={`mb-6 rounded-2xl p-4 flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="flex-1">{message.text}</p>
            <button onClick={() => setMessage(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Template Download */}
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <div className="flex gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Download className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Download {activeTab} Template</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get a sample Excel template for {activeTab}
                </p>
                <button
                  onClick={downloadTemplate}
                  disabled={downloadingTemplate}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  {downloadingTemplate ? "Preparing..." : "Download Template"}
                </button>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Export {activeTab} Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export all {activeTab} records from Firestore
                </p>
                <button
                  onClick={exportCurrentData}
                  disabled={downloadingTemplate}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  {downloadingTemplate ? "Exporting..." : "Export Data"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Excel */}
        <div className="bg-white rounded-2xl shadow-md border p-6 mb-8">
          <h3 className="font-semibold text-xl mb-4">Upload Excel File ({activeTab})</h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-gray-700 font-semibold">
              {file ? file.name : "Click to upload Excel file"}
            </span>
            <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>

        {/* Preview Section */}
        {showPreview && preview.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-xl">
                Preview {activeTab} ({preview.length} records)
              </h3>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
              >
                {uploading ? "Uploading..." : "Upload to Firestore"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 6).map((key) => (
                      <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((item, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      {Object.values(item)
                        .slice(0, 6)
                        .map((val: any, j) => (
                          <td key={j} className="px-4 py-2 text-gray-700">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <p className="text-sm text-gray-500 mt-3">
                  Showing first 10 of {preview.length} records
                </p>
              )}
            </div>
          </div>
        )}
      </div>
  );
}
