"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { apiClient } from "@/lib/api"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, CheckCircle, XCircle, Clock, UserCog, BarChart3, TrendingUp, Activity } from "lucide-react"

interface DashboardStats {
  pendingVerification: number
  verifiedPartners: number
  rejectedPartners: number
  incompleteOnboarding: number
  totalPartners: number
  totalClients: number
}

export function AdminDashboard() {
  const { adminUser, adminLogout } = useAdminAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getAdminStats()
        if (response.success && response.data) {
          setStats(response.data)
        } else {
          throw new Error(response.message || "Failed to fetch dashboard statistics")
        }
      } catch (error: any) {
        console.error("Dashboard stats error:", error)
        setError(error.message || "An error occurred while fetching dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleViewPendingPartners = () => {
    router.push("/admin/partners?status=pending_verification")
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {adminUser?.email?.split("@")[0] || "Admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/partners")}
              className="hidden md:flex"
            >
              <Users className="mr-2 h-4 w-4" />
              View All Partners
            </Button>
            <Button variant="default" size="sm" onClick={handleViewPendingPartners} className="hidden md:flex">
              <Clock className="mr-2 h-4 w-4" />
              Pending Verifications
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pending Verification"
            value={stats?.pendingVerification}
            description="Partners awaiting verification"
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            loading={loading}
            trend="up"
            trendValue="+12%"
            onClick={() => router.push("/admin/partners?status=pending_verification")}
            color="amber"
          />
          <StatsCard
            title="Verified Partners"
            value={stats?.verifiedPartners}
            description="Successfully verified partners"
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            loading={loading}
            trend="up"
            trendValue="+3%"
            onClick={() => router.push("/admin/partners?status=verified")}
            color="green"
          />
          <StatsCard
            title="Rejected Partners"
            value={stats?.rejectedPartners}
            description="Partners that were rejected"
            icon={<XCircle className="h-5 w-5 text-red-500" />}
            loading={loading}
            trend="down"
            trendValue="-2%"
            onClick={() => router.push("/admin/partners?status=rejected")}
            color="red"
          />
          <StatsCard
            title="Incomplete Onboarding"
            value={stats?.incompleteOnboarding}
            description="Partners with incomplete onboarding"
            icon={<UserCog className="h-5 w-5 text-blue-500" />}
            loading={loading}
            trend="up"
            trendValue="+8%"
            onClick={() => router.push("/admin/partners?status=incomplete")}
            color="blue"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Partner Overview */}
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Partner Overview</CardTitle>
                <CardDescription>Partner registration and verification metrics</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/partners")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Partners</p>
                      <p className="text-2xl font-bold">{stats?.totalPartners || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Verification Rate</p>
                      <p className="text-2xl font-bold">
                        {stats?.totalPartners ? Math.round((stats.verifiedPartners / stats.totalPartners) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest partner activities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[160px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.pendingVerification ? (
                    <ActivityItem
                      icon={<Clock className="h-4 w-4 text-amber-500" />}
                      title="New Verification Request"
                      description="A new partner is awaiting verification"
                      timestamp="Just now"
                    />
                  ) : null}
                  <ActivityItem
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                    title="Partner Verified"
                    description="Studio XYZ was verified successfully"
                    timestamp="2 hours ago"
                  />
                  <ActivityItem
                    icon={<UserCog className="h-4 w-4 text-blue-500" />}
                    title="New Partner Registration"
                    description="John Doe Photography registered"
                    timestamp="5 hours ago"
                  />
                  <ActivityItem
                    icon={<XCircle className="h-4 w-4 text-red-500" />}
                    title="Partner Rejected"
                    description="Incomplete documentation provided"
                    timestamp="Yesterday"
                  />
                  <ActivityItem
                    icon={<Users className="h-4 w-4 text-purple-500" />}
                    title="New Client Registration"
                    description="5 new clients registered this week"
                    timestamp="2 days ago"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.totalPartners || 0}</div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total registered partners</p>
              <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => router.push("/admin/partners")}>
                View All Partners
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total registered clients</p>
              <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => router.push("/admin/clients")}>
                View All Clients
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Weekly Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">12</div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-500">+28%</span> from last week
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-1 w-3/4 bg-green-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stats?.totalPartners ? Math.round((stats.verifiedPartners / stats.totalPartners) * 100) : 0}%
                </div>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-blue-500">+5%</span> from last month
              </p>
              <div className="mt-2 h-1 w-full bg-muted">
                <div className="h-1 w-1/2 bg-blue-500 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

interface StatsCardProps {
  title: string
  value: number | undefined
  description: string
  icon: React.ReactNode
  loading: boolean
  trend: "up" | "down" | "neutral"
  trendValue: string
  onClick: () => void
  color: "amber" | "green" | "red" | "blue" | "purple" | "gray"
}

function StatsCard({ title, value, description, icon, loading, trend, trendValue, onClick, color }: StatsCardProps) {
  const colorClasses = {
    amber: "bg-amber-50 border-amber-100",
    green: "bg-green-50 border-green-100",
    red: "bg-red-50 border-red-100",
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100",
    gray: "bg-gray-50 border-gray-100",
  }

  return (
    <Card
      className={`overflow-hidden border-l-4 ${
        color === "amber"
          ? "border-l-amber-500"
          : color === "green"
            ? "border-l-green-500"
            : color === "red"
              ? "border-l-red-500"
              : color === "blue"
                ? "border-l-blue-500"
                : color === "purple"
                  ? "border-l-purple-500"
                  : "border-l-gray-500"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <p className="text-sm font-medium">{title}</p>
          </div>
          {trend === "up" ? (
            <div className="text-xs font-medium text-green-600">{trendValue} ↑</div>
          ) : trend === "down" ? (
            <div className="text-xs font-medium text-red-600">{trendValue} ↓</div>
          ) : (
            <div className="text-xs font-medium text-gray-600">{trendValue} →</div>
          )}
        </div>
        <div className="mt-3">
          {loading ? <Skeleton className="h-9 w-16" /> : <div className="text-3xl font-bold">{value || 0}</div>}
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  icon: React.ReactNode
  title: string
  description: string
  timestamp: string
}

function ActivityItem({ icon, title, description, timestamp }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="ml-auto text-xs text-muted-foreground">{timestamp}</div>
    </div>
  )
}
