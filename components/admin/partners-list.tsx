"use client"

import type React from "react"
import { Users } from "lucide-react" // Import Users component

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreHorizontal,
  Eye,
  FileCheck,
  FileX,
  RefreshCw,
  ArrowUpDown,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Partner {
  _id: string
  companyName: string
  partnerType: string
  onboardingStatus: string
  verified: boolean
  createdAt: string
  user: {
    username: string
    email: string
  }
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export function PartnersList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [partners, setPartners] = useState<Partner[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [activeTab, setActiveTab] = useState(statusFilter === "all" ? "all" : statusFilter)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  useEffect(() => {
    fetchPartners(1)
  }, [statusFilter, sortBy, sortOrder])

  const fetchPartners = async (page: number) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams: any = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      }

      if (statusFilter !== "all") {
        queryParams.status = statusFilter
      }

      if (searchTerm) {
        queryParams.search = searchTerm
      }

      const response = await apiClient.getPartners(queryParams)

      if (response.success && response.data) {
        setPartners(response.data.partners)
        setPagination(response.data.pagination)
      } else {
        throw new Error(response.message || "Failed to fetch partners")
      }
    } catch (error: any) {
      console.error("Fetch partners error:", error)
      setError(error.message || "An error occurred while fetching partners")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPartners(1)
  }

  const handlePageChange = (page: number) => {
    fetchPartners(page)
  }

  const handlePartnerClick = (partnerId: string) => {
    router.push(`/admin/partners/${partnerId}`)
  }

  const handleSelectPartner = (partnerId: string, checked: boolean) => {
    if (checked) {
      setSelectedPartners([...selectedPartners, partnerId])
    } else {
      setSelectedPartners(selectedPartners.filter((id) => id !== partnerId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPartners(partners.map((partner) => partner._id))
    } else {
      setSelectedPartners([])
    }
  }

  const handleBulkAction = async (action: "verify" | "reject") => {
    if (selectedPartners.length === 0) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.bulkAction(action, selectedPartners)

      if (response.success) {
        // Refresh the list
        fetchPartners(pagination.page)
        setSelectedPartners([])
      } else {
        throw new Error(response.message || `Failed to ${action} partners`)
      }
    } catch (error: any) {
      console.error("Bulk action error:", error)
      setError(error.message || "An error occurred while performing bulk action")
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setStatusFilter(value === "all" ? "all" : value)
    router.push(value === "all" ? "/admin/partners" : `/admin/partners?status=${value}`)
  }

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <Clock className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">Pending</span>
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">Verified</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">Rejected</span>
          </Badge>
        )
      case "incomplete":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
            <Clock className="mr-1 h-3 w-3" />
            <span className="hidden xs:inline">Incomplete</span>
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
            {status}
          </Badge>
        )
    }
  }

  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case "studio":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Studio
          </Badge>
        )
      case "solo":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Solo
          </Badge>
        )
      case "firm":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Firm
          </Badge>
        )
      case "partnership":
        return (
          <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
            Partnership
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const renderPagination = () => {
    const { page, pages } = pagination
    const pageItems = []

    // Previous button
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => page > 1 && handlePageChange(page - 1)}
          className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>,
    )

    // First page
    if (pages > 0) {
      pageItems.push(
        <PaginationItem key={1} className="hidden sm:inline-block">
          <PaginationLink onClick={() => handlePageChange(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis if needed
    if (page > 3) {
      pageItems.push(
        <PaginationItem key="ellipsis1" className="hidden sm:inline-block">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Pages around current
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      pageItems.push(
        <PaginationItem key={i} className="hidden sm:inline-block">
          <PaginationLink onClick={() => handlePageChange(i)} isActive={page === i}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Ellipsis if needed
    if (page < pages - 2) {
      pageItems.push(
        <PaginationItem key="ellipsis2" className="hidden sm:inline-block">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Last page
    if (pages > 1) {
      pageItems.push(
        <PaginationItem key={pages} className="hidden sm:inline-block">
          <PaginationLink onClick={() => handlePageChange(pages)} isActive={page === pages}>
            {pages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Current page indicator for mobile
    pageItems.push(
      <PaginationItem key="current-mobile" className="sm:hidden">
        <span className="text-sm">
          Page {page} of {pages}
        </span>
      </PaginationItem>,
    )

    // Next button
    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => page < pages && handlePageChange(page + 1)}
          className={page >= pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>,
    )

    return <PaginationContent>{pageItems}</PaginationContent>
  }

  // Mobile card view for partners
  const renderPartnerCard = (partner: Partner) => (
    <Card key={partner._id} className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Checkbox
              checked={selectedPartners.includes(partner._id)}
              onCheckedChange={(checked) => handleSelectPartner(partner._id, !!checked)}
              onClick={(e) => e.stopPropagation()}
              className="mr-3"
            />
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {partner.companyName?.charAt(0)?.toUpperCase() ||
                  partner.user?.username?.charAt(0)?.toUpperCase() ||
                  "P"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handlePartnerClick(partner._id)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePartnerClick(partner._id)
                  }}
                >
                  View Details
                </DropdownMenuItem>
                {partner.onboardingStatus === "pending_verification" && (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBulkAction("verify")
                      }}
                    >
                      Approve Partner
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBulkAction("reject")
                      }}
                    >
                      Reject Partner
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>Send Message</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="space-y-2" onClick={() => handlePartnerClick(partner._id)}>
          <div>
            <h3 className="font-medium text-base">{partner.companyName}</h3>
            <p className="text-sm text-muted-foreground">{partner.user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {getPartnerTypeIcon(partner.partnerType)}
            {getStatusBadge(partner.onboardingStatus)}
          </div>
          <div className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(new Date(partner.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Partner Management</h1>
            <p className="text-muted-foreground">Manage and verify partner accounts</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedPartners.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                  onClick={() => handleBulkAction("verify")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Verify</span> ({selectedPartners.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  onClick={() => handleBulkAction("reject")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Reject</span> ({selectedPartners.length})
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPartners(pagination.page)}
              className="hidden md:flex"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex w-full md:grid md:grid-cols-5 px-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending_verification">Pending</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            </TabsList>
          </ScrollArea>
          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                    <Button type="submit" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="flex items-center">
                    {/* Mobile filter button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="md:hidden mr-2"
                      onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>

                    {/* Desktop filters */}
                    <div className="hidden md:flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Sort:</span>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Date Created</SelectItem>
                          <SelectItem value="companyName">Company Name</SelectItem>
                          <SelectItem value="partnerType">Partner Type</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Mobile filters (collapsible) */}
                {isMobileFilterOpen && (
                  <div className="mt-4 space-y-3 md:hidden">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Sort by:</span>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Date Created</SelectItem>
                          <SelectItem value="companyName">Company Name</SelectItem>
                          <SelectItem value="partnerType">Partner Type</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Order:</span>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Mobile view - cards */}
                    <div className="md:hidden">
                      {partners.length === 0 ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-8">
                          <div className="rounded-full bg-muted p-3">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-lg font-medium">No partners found</div>
                          <div className="text-sm text-muted-foreground text-center">
                            {searchTerm ? "Try a different search term" : "Partners will appear here once registered"}
                          </div>
                        </div>
                      ) : (
                        partners.map((partner) => renderPartnerCard(partner))
                      )}
                    </div>

                    {/* Desktop view - table */}
                    <div className="hidden md:block rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-12">
                              <Checkbox
                                checked={selectedPartners.length === partners.length && partners.length > 0}
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                              />
                            </TableHead>
                            <TableHead>
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSortToggle("companyName")}
                              >
                                Company
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>Partner Type</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSortToggle("onboardingStatus")}
                              >
                                Status
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead>
                              <div
                                className="flex items-center cursor-pointer"
                                onClick={() => handleSortToggle("createdAt")}
                              >
                                Created
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partners.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                                  <div className="rounded-full bg-muted p-3">
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                  <div className="text-lg font-medium">No partners found</div>
                                  <div className="text-sm text-muted-foreground">
                                    {searchTerm
                                      ? "Try a different search term"
                                      : "Partners will appear here once registered"}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            partners.map((partner) => (
                              <TableRow
                                key={partner._id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handlePartnerClick(partner._id)}
                              >
                                <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={selectedPartners.includes(partner._id)}
                                    onCheckedChange={(checked) => handleSelectPartner(partner._id, !!checked)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="bg-primary/10 text-primary">
                                        {partner.companyName?.charAt(0)?.toUpperCase() ||
                                          partner.user?.username?.charAt(0)?.toUpperCase() ||
                                          "P"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{partner.companyName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        ID: {partner._id.substring(0, 8)}...
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{getPartnerTypeIcon(partner.partnerType)}</TableCell>
                                <TableCell>{partner.user?.email}</TableCell>
                                <TableCell>{getStatusBadge(partner.onboardingStatus)}</TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span>{formatDistanceToNow(new Date(partner.createdAt), { addSuffix: true })}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(partner.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handlePartnerClick(partner._id)
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {partner.onboardingStatus === "pending_verification" && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleBulkAction("verify")
                                          }}
                                        >
                                          <FileCheck className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleBulkAction("reject")
                                          }}
                                        >
                                          <FileX className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handlePartnerClick(partner._id)
                                          }}
                                        >
                                          View Details
                                        </DropdownMenuItem>
                                        {partner.onboardingStatus === "pending_verification" && (
                                          <>
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleBulkAction("verify")
                                              }}
                                            >
                                              Approve Partner
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleBulkAction("reject")
                                              }}
                                            >
                                              Reject Partner
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {partners.length} of {pagination.total} partners
                      </div>
                      <Pagination>{renderPagination()}</Pagination>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
