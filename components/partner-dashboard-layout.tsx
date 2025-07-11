"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Camera,
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
  Bell,
  Search,
  HelpCircle,
  ChevronDown,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { signOut } from "@/lib/auth"
import { usePathname } from "next/navigation"

interface PartnerDashboardLayoutProps {
  children: React.ReactNode
}

export function PartnerDashboardLayout({ children }: PartnerDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/partner/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      href: "/partner/dashboard",
      icon: BarChart3,
      current: pathname === "/partner/dashboard",
    },
    {
      name: "Lead Management",
      href: "/partner/leads",
      icon: Users,
      badge: 12, // This would come from API
      current: pathname === "/partner/leads",
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
      current: pathname === "/partner/bookings",
    },*/
    {
      name: "Portfolio",
      href: "/partner/portfolio",
      icon: ImageIcon,
      current: pathname === "/partner/portfolio",
    },
    {
      name: "Profile Setup",
      href: "/partner/profile",
      icon: User,
      current: pathname === "/partner/profile",
    },
    /*{
      name: "Reviews",
      href: "/partner/reviews",
      icon: Star,
      current: pathname === "/partner/reviews",
    }*/,
    /*{
      name: "Messages",
      href: "/partner/chat",
      icon: MessageSquare,
      badge: 2,
      badgeVariant: "destructive",
      current: pathname === "/partner/chat",
    },
    {
      name: "Billing",
      href: "/partner/billing",
      icon: CreditCard,
      current: pathname === "/partner/billing",
    },*/
    {
      name: "Settings",
      href: "/partner/profile",
      icon: Settings,
      current: pathname === "/partner/settings",
    },
  ]

  // Sidebar component
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-screen ${mobile ? "w-full" : "w-64"} bg-white border-r border-gray-200`}>
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
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
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
      <div className="border-t p-4 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-black text-white text-sm">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.displayName || user?.email?.split("@")[0]}</p>
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
                    {user?.displayName
                      ? user.displayName.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{user?.displayName || user?.email?.split("@")[0]}</p>
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

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-screen">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Createsco</span>
                </Link>
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
                          {user?.displayName
                            ? user.displayName.charAt(0).toUpperCase()
                            : user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.displayName || user?.email?.split("@")[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user?.displayName || user?.email?.split("@")[0]}</p>
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
          </header>

          {/* Page Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
