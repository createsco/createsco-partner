"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { Loader2, Camera } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const { adminUser, loading } = useAdminAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only redirect if we're on client side, not loading, have admin user, and haven't redirected yet
    if (isClient && !loading && adminUser && !hasRedirected) {
      console.log("Already authenticated as admin, redirecting to dashboard")
      setHasRedirected(true)
      router.push("/admin/dashboard")
    }
  }, [adminUser, loading, router, isClient, hasRedirected])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium text-gray-600">Checking authentication...</p>
      </div>
    )
  }

  // If already authenticated and redirecting, show loading
  if (adminUser && hasRedirected) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-600">Redirecting to dashboard...</p>
      </div>
    )
  }

  // Only render the login form if not authenticated
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-0 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <Camera className="h-8 w-8 text-black" />
              <span className="text-2xl font-bold text-black">Createsco</span>
            </Link>
          </div>
        </div>
        <AdminLoginForm />
        <div className="text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
