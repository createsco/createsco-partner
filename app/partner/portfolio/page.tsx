"use client"

import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout"
import { PortfolioManager } from "@/components/portfolio-manager"

export default function PortfolioPage() {
  return (
    <PartnerDashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your photography portfolio and showcase your best work to potential clients.
          </p>
        </div>
        <PortfolioManager />
      </div>
    </PartnerDashboardLayout>
  )
}
