"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { PartnerDetails } from "@/components/admin/partner-details"

export default function AdminPartnerDetailsPage({ params }: { params: { id: string } }) {
  const { adminUser, loading } = useAdminAuth()
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    if (!loading && !adminUser) {
      router.push("/admin")
    }
  }, [adminUser, loading, router])

  if (loading || !adminUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return <PartnerDetails partnerId={id} />
}
