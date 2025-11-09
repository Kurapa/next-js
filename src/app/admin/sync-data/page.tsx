"use client";

import AdminRoute from "@/components/auth/AdminRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SyncDataPageContent from "./SyncDataPageContent";

// Separate your huge component logic to keep this clean
export default function SyncDataPage() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <SyncDataPageContent />
      </DashboardLayout>
    </AdminRoute>
  );
}
