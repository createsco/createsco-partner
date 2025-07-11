"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Camera,
  TrendingUp,
  Users,
  Calendar,
  Star,
  MessageSquare,
  ImageIcon,
  Settings,
  CreditCard,
  BarChart3,
  LogOut,
  User,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle,
  DollarSign,
  Eye,
  Mail,
  MapPin,
  TrendingDown,
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  Download,
  RefreshCw,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { signOut } from "@/lib/auth"
import { apiClient } from "@/lib/api"

export function PartnerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [leadStats, setLeadStats] = useState<any>(null)
  const [loadingLeadStats, setLoadingLeadStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodState, setPeriodState] = useState("30")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/partner/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchLeadStats = async () => {
      if (!user) return

      try {
        setLoadingLeadStats(true)
        setError(null)
        const response = await apiClient.getLeadStats({ period: periodState })

        if (response.success && response.data) {
          setLeadStats(response.data)
        } else {
          // Mock data for development
          setLeadStats({
            statusBreakdown: [
              { _id: "new", count: 12 },
              { _id: "contacted", count: 8 },
              { _id: "converted", count: 3 },
              { _id: "closed", count: 2 },
            ],
            priorityBreakdown: [
              { _id: "high", count: 5 },
              { _id: "medium", count: 10 },
              { _id: "low", count: 7 },
            ],
            recentLeads: [
              {
                _id: "1",
                clientId: { username: "Ananya Kapoor", email: "ananya@example.com" },
                serviceType: "Wedding Photography",
                status: "new",
                createdAt: new Date().toISOString(),
                budget: { max: 25000 },
                location: "Mumbai",
              },
              {
                _id: "2",
                clientId: { username: "Rahul Sharma", email: "rahul@example.com" },
                serviceType: "Corporate Event",
                status: "contacted",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                budget: { max: 15000 },
                location: "Delhi",
              },
              {
                _id: "3",
                clientId: { username: "Meera Patel", email: "meera@example.com" },
                serviceType: "Maternity Shoot",
                status: "converted",
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                budget: { max: 8000 },
                location: "Bangalore",
              },
            ],
            responseRate: 75.5,
            conversionRate: 25.0,
            totalRevenue: 125000,
            monthlyGrowth: 12.5,
          })
        }
      } catch (error: any) {
        console.error("Failed to fetch lead stats:", error)
        setError(error.message || "An error occurred while fetching lead statistics")
        // Set mock data on error
        setLeadStats({
          statusBreakdown: [
            { _id: "new", count: 12 },
            { _id: "contacted", count: 8 },
            { _id: "converted", count: 3 },
            { _id: "closed", count: 2 },
          ],
          priorityBreakdown: [
            { _id: "high", count: 5 },
            { _id: "medium", count: 10 },
            { _id: "low", count: 7 },
          ],
          recentLeads: [],
          responseRate: 75.5,
          conversionRate: 25.0,
          totalRevenue: 125000,
          monthlyGrowth: 12.5,
        })
      } finally {
        setLoadingLeadStats(false)
      }
    }

    fetchLeadStats()
  }, [user, periodState])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/partner/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getStatusCount = (status: string) => {
    return leadStats?.statusBreakdown?.find((s: any) => s._id === status)?.count || 0
  }

  const getPriorityCount = (priority: string) => {
    return leadStats?.priorityBreakdown?.find((p: any) => p._id === priority)?.count || 0
  }

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/partner/dashboard",
      icon: BarChart3,
      current: true,
    },
    {
      name: "Lead Management",
      href: "/partner/leads",
      icon: Users,
      badge: getStatusCount("new"),
      children: [
        { name: "New Leads", href: "/partner/leads?status=new" },
        { name: "In Progress", href: "/partner/leads?status=contacted" },
        { name: "Converted", href: "/partner/leads?status=converted" },
      ],
    },
    /*{
      name: "Bookings",
      href: "/partner/bookings",
      icon: Calendar,
    },*/
    {
      name: "Portfolio",
      href: "/partner/portfolio",
      icon: ImageIcon,
    },
    {
      name: "Profile Setup",
      href: "/partner/profile",
      icon: User,
    },
    /*{
      name: "Reviews",
      href: "/partner/reviews",
      icon: Star,
    }*/,
    /*{
      name: "Messages",
      href: "/partner/chat",
      icon: MessageSquare,
      badge: 2,
      badgeVariant: "destructive",
    },
    {
      name: "Billing",
      href: "/partner/billing",
      icon: CreditCard,
    },*/
    {
      name: "Settings",
      href: "/partner/profile",
      icon: Settings,
    },
  ]

  // Sidebar component
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "w-full" : "w-64"} bg-white border-r border-gray-200`}>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Createsco</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className="text-gray-400 group-hover:text-gray-500 mr-3 h-5 w-5" />
                {item.name}
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant || "secondary"}
                    className={`ml-auto ${item.badgeVariant === "destructive" ? "" : "bg-blue-100 text-blue-800"}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
              {item.children && (
                <div className="ml-6 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-1 text-sm rounded-md transition-colors"
                      onClick={() => mobile && setSidebarOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-black text-white text-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</p>
                <p className="text-xs text-gray-500">Partner</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem asChild>
              <Link href="/partner/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/partner/profile" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center bg-black text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Left side - Menu and Logo */}
        <div className="flex items-center space-x-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Createsco</span>
          </Link>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-black text-white text-sm font-medium">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</p>
                <p className="text-xs text-gray-500">Partner</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/partner/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/partner/profile" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop Top Header Bar */}
      {/* Desktop Header - Integrated into Sidebar Layout */}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-screen ">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-50">
            {/* Desktop Header Content */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                
                 <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your photography business and client leads</p>
              </div>
              </div>

              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      2
                    </span>
                  </Button>
                </div>
              

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-black text-white text-sm font-medium">
                          {user.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.displayName || user.email?.split("@")[0]}</p>
                      <p className="text-xs text-gray-500">Partner</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/partner/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/partner/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Page Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
             
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              </div>
            </div>

            
          </header>

          {/* Dashboard Content */}
          <main className="p-4 lg:p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Lead Stats Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatsCard
                title="New Leads"
                value={getStatusCount("new")}
                description="Leads awaiting response"
                icon={<Clock className="h-5 w-5 text-amber-500" />}
                loading={loadingLeadStats}
                trend="up"
                trendValue="+12%"
                onClick={() => router.push("/partner/leads?status=new")}
                color="amber"
              />
              <StatsCard
                title="Contacted"
                value={getStatusCount("contacted")}
                description="Leads in discussion"
                icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
                loading={loadingLeadStats}
                trend="up"
                trendValue="+8%"
                onClick={() => router.push("/partner/leads?status=contacted")}
                color="blue"
              />
              <StatsCard
                title="Converted"
                value={getStatusCount("converted")}
                description="Successfully booked clients"
                icon={<CheckCircle className="h-5 w-5 text-green-500" />}
                loading={loadingLeadStats}
                trend="up"
                trendValue="+15%"
                onClick={() => router.push("/partner/leads?status=converted")}
                color="green"
              />
              <StatsCard
                title="Conversion Rate"
                value={leadStats?.conversionRate ? `${leadStats.conversionRate.toFixed(1)}%` : "0%"}
                description="Lead to booking ratio"
                icon={<Activity className="h-5 w-5 text-purple-500" />}
                loading={loadingLeadStats}
                trend="up"
                trendValue="+4.5%"
                onClick={() => router.push("/partner/leads")}
                color="purple"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
              {/* Lead Overview */}
              <Card className="lg:col-span-4">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
                  <div className="space-y-1 mb-4 sm:mb-0">
                    <CardTitle>Lead Overview</CardTitle>
                    <CardDescription>Your lead management and conversion metrics</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push("/partner/leads")}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingLeadStats ? (
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
                          <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                          <p className="text-2xl font-bold">
                            {leadStats?.statusBreakdown?.reduce((acc: number, item: any) => acc + item.count, 0) || 0}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                          <p className="text-2xl font-bold">{leadStats?.responseRate?.toFixed(1) || 0}%</p>
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
                  <CardDescription>Latest lead activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingLeadStats ? (
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
                      {getStatusCount("new") > 0 && (
                        <ActivityItem
                          icon={<Clock className="h-4 w-4 text-amber-500" />}
                          title="New Lead Received"
                          description={`${getStatusCount("new")} new leads awaiting response`}
                          timestamp="Just now"
                        />
                      )}
                      <ActivityItem
                        icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                        title="Lead Converted"
                        description="Wedding photography booking confirmed"
                        timestamp="2 hours ago"
                      />
                      <ActivityItem
                        icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
                        title="Client Response"
                        description="Received message from Ananya Kapoor"
                        timestamp="5 hours ago"
                      />
                      <ActivityItem
                        icon={<DollarSign className="h-4 w-4 text-green-500" />}
                        title="Payment Received"
                        description="₹15,000 advance payment"
                        timestamp="Yesterday"
                      />
                      <ActivityItem
                        icon={<Star className="h-4 w-4 text-yellow-500" />}
                        title="Review Received"
                        description="5-star review from Meera Patel"
                        timestamp="2 days ago"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Leads Table */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>Manage your latest client inquiries</CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/partner/leads">
                      View All Leads
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingLeadStats ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : leadStats?.recentLeads?.length > 0 ? (
                    <div className="space-y-3">
                      {leadStats.recentLeads.map((lead: any) => (
                        <div
                          key={lead._id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer space-y-3 sm:space-y-0"
                          onClick={() => router.push(`/partner/leads/${lead._id}`)}
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {lead.clientId?.username?.substring(0, 2).toUpperCase() || "CL"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{lead.clientId?.username || "Unknown Client"}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>{lead.serviceType || "Photography Service"}</span>
                                {lead.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{lead.location}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{lead.clientId?.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-4">
                            {lead.budget?.max && (
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">₹{lead.budget.max.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Budget</p>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  lead.status === "new"
                                    ? "secondary"
                                    : lead.status === "contacted"
                                      ? "outline"
                                      : lead.status === "converted"
                                        ? "default"
                                        : "secondary"
                                }
                                className={
                                  lead.status === "new"
                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                    : lead.status === "contacted"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : lead.status === "converted"
                                        ? "bg-green-100 text-green-800 border-green-200"
                                        : ""
                                }
                              >
                                {lead.status}
                              </Badge>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                      <p className="text-gray-500 mb-4">New client inquiries will appear here</p>
                      <Button asChild>
                        <Link href="/partner/profile">Complete Your Profile</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number | string | undefined
  description: string
  icon: React.ReactNode
  loading: boolean
  trend: "up" | "down" | "neutral"
  trendValue: string
  onClick: () => void
  color: "amber" | "green" | "red" | "blue" | "purple" | "gray"
}

function StatsCard({ title, value, description, icon, loading, trend, trendValue, onClick, color }: StatsCardProps) {
  return (
    <Card
      className={`overflow-hidden border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
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
            <div className="text-xs font-medium text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trendValue}
            </div>
          ) : trend === "down" ? (
            <div className="text-xs font-medium text-red-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              {trendValue}
            </div>
          ) : (
            <div className="text-xs font-medium text-gray-600">{trendValue}</div>
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

export default PartnerDashboard
