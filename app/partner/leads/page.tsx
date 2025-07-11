import { LeadsManager } from "@/components/leads-manager"
import { PartnerDashboardLayout } from "@/components/partner-dashboard-layout"

export default function LeadsPage() {
  return (
    <PartnerDashboardLayout>
      <LeadsManager />
    </PartnerDashboardLayout>
  )
}
