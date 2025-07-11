"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { PartnersList } from "@/components/admin/partners-list"

export default function AdminPartnersPage() {
  const { adminUser, loading } = useAdminAuth()
  const router = useRouter()

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

  return <PartnersList />
}
