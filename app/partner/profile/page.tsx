"use client"

import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout"
import { ProfileManager } from "@/components/profile-manager"

export default function PartnerProfilePage() {
  return (
    <PartnerDashboardLayout>
      <ProfileManager />
    </PartnerDashboardLayout>
  )
}
