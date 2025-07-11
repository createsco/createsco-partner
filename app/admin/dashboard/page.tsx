"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  const { adminUser, loading, error } = useAdminAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Only redirect if not loading, no admin user, and haven't redirected yet
    if (!loading && !adminUser && !hasRedirected) {
      console.log("Not authenticated as admin, redirecting to login")
      setHasRedirected(true)
      router.push("/admin")
    }
  }, [adminUser, loading, router, hasRedirected])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-16 w-16 text-primary animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Verifying Admin Access</p>
            <p className="text-sm text-gray-600">Please wait while we check your permissions...</p>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error, show access denied
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-6 text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You don't have permission to access the admin dashboard. Please contact your administrator if you believe
              this is an error.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => router.push("/admin")} variant="outline">
              Admin Login
            </Button>
            <Button onClick={() => router.push("/")} variant="default">
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If redirecting, show redirect message
  if (!adminUser && hasRedirected) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium text-gray-600">Redirecting to admin login...</p>
        </div>
      </div>
    )
  }

  // Only render the dashboard if authenticated and no errors
  if (adminUser) {
    return <AdminDashboard />
  }

  // Fallback loading state
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
