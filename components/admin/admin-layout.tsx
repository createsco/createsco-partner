"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import {
  Camera,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  FileCheck,
  Search,
  HelpCircle,
  BarChart2,
  UserCog,
  MessageSquare,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { adminUser, adminLogout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      name: "Partner Management",
      href: "/admin/partners",
      icon: Users,
      children: [
        { name: "All Partners", href: "/admin/partners" },
        { name: "Pending Verification", href: "/admin/partners?status=pending_verification" },
        { name: "Verified Partners", href: "/admin/partners?status=verified" },
        { name: "Rejected Partners", href: "/admin/partners?status=rejected" },
      ],
    },
    { name: "Verifications", href: "/admin/partners?status=pending_verification", icon: FileCheck },
    { name: "Client Management", href: "/admin/clients", icon: UserCog },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Createsco</span>
          </Link>
          <button
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <nav className="space-y-1 px-3">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-gray-100 text-primary"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.href) ? "text-primary" : "text-gray-400 group-hover:text-primary"
                      }`}
                    />
                    {item.name}
                  </Link>
                  {item.children && isActive(item.href) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block rounded-md py-1.5 px-3 text-sm font-medium ${
                            pathname === subItem.href ||
                            (subItem.href.includes("?") && pathname + window.location.search === subItem.href)
                              ? "text-primary"
                              : "text-gray-600 hover:text-primary"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{adminUser?.email?.split("@")[0] || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={adminLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={adminLogout}>
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
          <button
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start p-3">
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">New Partner Registration</span>
                      <span className="text-xs text-muted-foreground">{i}h ago</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      A new partner has registered and is awaiting verification.
                    </span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium">View all notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center space-x-2 rounded-full p-1 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {adminUser?.email?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:block">{adminUser?.email}</span>
                  <ChevronDown className="hidden h-4 w-4 md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={adminLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
