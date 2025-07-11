"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Camera,
  ArrowLeft,
  Search,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  Send,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  PlusCircle,
  FileText,
  Tag,
  Bell,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  ThumbsUp,
  Briefcase,
  Banknote,
  User,
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format, formatDistanceToNow } from "date-fns"

// Types based on actual API response
interface Lead {
  _id: string
  clientId: {
    _id: string
    username: string
    email: string
    profilePic?: string
    phone?: {
      countryCode: string
      number: string
    }
    address?: string
  } | null
  partnerId: {
    _id: string
    username: string
    email: string
    profilePic?: string
    phone?: {
      countryCode: string
      number: string
    }
    fullPhone?: string
  }
  message: string
  serviceType?: string
  eventDate?: string
  budget?: {
    min?: number
    max?: number
    currency: string
  }
  location?: string
  status: "new" | "contacted" | "converted" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  contactMethod: string
  source: string
  createdAt: string
  updatedAt: string
  notes?: Array<{
    _id: string
    note: string
    addedBy: string
    addedAt: string
  }>
}

interface LeadsPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<LeadsPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [noteLoading, setNoteLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [responseLoading, setResponseLoading] = useState(false)
  const [leadDetailsLoading, setLeadDetailsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [leadStats, setLeadStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsPeriod, setStatsPeriod] = useState("30")
  const [currentUser, setCurrentUser] = useState<any>(null)

  const { toast } = useToast()
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  // Status colors for badges
  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    converted: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  }

  // Priority colors for badges
  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }

  // Status icons
  const statusIcons = {
    new: <Bell className="h-4 w-4" />,
    contacted: <MessageCircle className="h-4 w-4" />,
    converted: <ThumbsUp className="h-4 w-4" />,
    closed: <CheckCircle className="h-4 w-4" />,
  }

  // Priority icons
  const priorityIcons = {
    low: <Bookmark className="h-4 w-4" />,
    medium: <BookmarkCheck className="h-4 w-4" />,
    high: <BookmarkX className="h-4 w-4" />,
    urgent: <AlertCircle className="h-4 w-4" />,
  }

  // Get current user info
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.getMe()
      if (response.success && response.data) {
        setCurrentUser(response.data.user)
        console.log("📤 Current user:", response.data.user)
      }
    } catch (err) {
      console.error("❌ Error fetching current user:", err)
    }
  }

  // Fetch leads
  const fetchLeads = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      }

      if (filterStatus !== "all") {
        params.status = filterStatus
      }

      console.log("📤 Fetching leads with params:", params)
      console.log("📤 Current user info:", currentUser)

      const response = await apiClient.getLeads(params)
      console.log("📥 Leads response:", response)

      if (response.success && response.data) {
        setLeads(response.data.leads)
        setPagination(response.data.pagination)
        console.log("📥 Fetched leads:", response.data.leads)
      } else {
        setError(response.message || "Failed to fetch leads")
      }
    } catch (err: any) {
      console.error("❌ Error fetching leads:", err)
      setError(err.message || "An error occurred while fetching leads")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch lead stats
  const fetchLeadStats = async () => {
    setStatsLoading(true)

    try {
      const response = await apiClient.getLeadStats({ period: statsPeriod })

      if (response.success && response.data) {
        setLeadStats(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch lead stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  // Fetch lead details
  const fetchLeadDetails = async (leadId: string) => {
    setLeadDetailsLoading(true)

    try {
      console.log("📤 Fetching lead details:", leadId)
      const response = await apiClient.getLeadDetails(leadId)
      console.log("📥 Lead details response:", response)

      if (response.success && response.data) {
        setSelectedLead(response.data.lead)
        setViewMode("detail")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch lead details",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("❌ Error fetching lead details:", err)
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLeadDetailsLoading(false)
    }
  }

  // Update lead status
  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      console.log("📤 Updating lead status:", { leadId, status })
      console.log("📤 Current user ID:", currentUser?.id)

      const response = await apiClient.updateLead(leadId, { status })
      console.log("📥 Update status response:", response)

      if (response.success && response.data) {
        // Update the lead in the list
        setLeads(leads.map((lead) => (lead._id === leadId ? response.data.lead : lead)))

        // Update selected lead if viewing details
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(response.data.lead)
        }

        toast({
          title: "Success",
          description: `Lead status updated to ${status}`,
        })
      } else {
        console.error("❌ Failed to update lead status:", response)
        toast({
          title: "Error",
          description: response.message || "Failed to update lead status",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("❌ Error updating lead status:", err)
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Update lead priority
  const updateLeadPriority = async (leadId: string, priority: string) => {
    try {
      console.log("📤 Updating lead priority:", { leadId, priority })
      console.log("📤 Current user ID:", currentUser?.id)

      const response = await apiClient.updateLead(leadId, { priority })
      console.log("📥 Update priority response:", response)

      if (response.success && response.data) {
        // Update the lead in the list
        setLeads(leads.map((lead) => (lead._id === leadId ? response.data.lead : lead)))

        // Update selected lead if viewing details
        if (selectedLead && selectedLead._id === leadId) {
          setSelectedLead(response.data.lead)
        }

        toast({
          title: "Success",
          description: `Lead priority updated to ${priority}`,
        })
      } else {
        console.error("❌ Failed to update lead priority:", response)
        toast({
          title: "Error",
          description: response.message || "Failed to update lead priority",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("❌ Error updating lead priority:", err)
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Add note to lead
  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return

    setNoteLoading(true)

    try {
      console.log("📤 Adding note:", { leadId: selectedLead._id, note: newNote })
      const response = await apiClient.addLeadNote(selectedLead._id, newNote)
      console.log("📥 Add note response:", response)

      if (response.success && response.data) {
        setSelectedLead(response.data.lead)
        setNewNote("")
        setNoteDialogOpen(false)

        toast({
          title: "Success",
          description: "Note added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add note",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("❌ Error adding note:", err)
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setNoteLoading(false)
    }
  }

  // Send response to lead
  const sendResponse = async () => {
    if (!selectedLead || !responseMessage.trim()) return

    setResponseLoading(true)

    try {
      // First add the note
      const noteResponse = await apiClient.addLeadNote(selectedLead._id, responseMessage)

      if (noteResponse.success) {
        // Then update the status to contacted if it's new
        if (selectedLead.status === "new") {
          await apiClient.updateLead(selectedLead._id, { status: "contacted" })
        }

        // Refresh lead details
        const detailsResponse = await apiClient.getLeadDetails(selectedLead._id)

        if (detailsResponse.success && detailsResponse.data) {
          setSelectedLead(detailsResponse.data.lead)
        }

        setResponseMessage("")
        setResponseDialogOpen(false)

        toast({
          title: "Success",
          description: "Response sent successfully",
        })

        // Refresh the leads list
        fetchLeads()
      } else {
        throw new Error(noteResponse.message || "Failed to send response")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setResponseLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Filter leads by search query
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (lead.serviceType && lead.serviceType.toLowerCase().includes(query)) ||
      (lead.location && lead.location.toLowerCase().includes(query)) ||
      lead.message.toLowerCase().includes(query)
    )
  })

  // Format phone number
  const formatPhone = (phone?: { countryCode: string; number: string }) => {
    if (!phone) return "N/A"
    return `${phone.countryCode} ${phone.number}`
  }

  // Format budget
  const formatBudget = (budget?: { min?: number; max?: number; currency: string }) => {
    if (!budget) return "Not specified"

    const currency = budget.currency || "INR"
    const currencySymbol = currency === "INR" ? "₹" : "$"

    if (budget.min && budget.max) {
      return `${currencySymbol}${budget.min.toLocaleString()} - ${currencySymbol}${budget.max.toLocaleString()}`
    } else if (budget.min) {
      return `${currencySymbol}${budget.min.toLocaleString()}+`
    } else if (budget.max) {
      return `Up to ${currencySymbol}${budget.max.toLocaleString()}`
    }

    return "Not specified"
  }

  // Get client display name (since clientId is null, we'll show "Client Inquiry")
  const getClientDisplayName = (lead: Lead) => {
    if (lead.clientId?.username) {
      return lead.clientId.username
    }
    return "Client Inquiry"
  }

  // Get client phone (show partner phone since client data is not available)
  const getClientPhone = (lead: Lead) => {
    if (lead.clientId?.phone) {
      return formatPhone(lead.clientId.phone)
    }
    // Since clientId is null, show partner phone if available for contact reference
    if (lead.partnerId?.phone) {
      return formatPhone(lead.partnerId.phone)
    }
    return "Contact via message"
  }

  // Load initial data
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchLeads()
      fetchLeadStats()
    }
  }, [pagination.page, filterStatus, sortBy, sortOrder, currentUser])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [filterStatus])

  // Focus note input when dialog opens
  useEffect(() => {
    if (noteDialogOpen && noteInputRef.current) {
      setTimeout(() => {
        noteInputRef.current?.focus()
      }, 100)
    }
  }, [noteDialogOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b sticky top-0 z-40 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {viewMode === "detail" ? (
              <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            ) : (
              <Link href="/partner/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <h1 className="text-lg font-semibold">{viewMode === "detail" ? "Lead Details" : "My Leads"}</h1>
          </div>
          {viewMode === "list" && <Badge variant="secondary">{pagination.total}</Badge>}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-white border-b sticky top-0 z-40 hidden md:block">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/partner/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Camera className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{viewMode === "detail" ? "Lead Details" : "My Leads"}</h1>
          </div>
          {viewMode === "list" && (
            <Badge variant="secondary" className="text-sm">
              {pagination.total} leads
            </Badge>
          )}
        </div>
      </header>

      <div className="p-4 md:p-6">
        {viewMode === "list" ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
              <Card className="p-3 md:p-6">
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  ) : (
                    <div className="text-lg md:text-2xl font-bold text-blue-600">
                      {leadStats?.statusBreakdown?.find((s: any) => s._id === "new")?.count || 0}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-gray-600">New Leads</div>
                </div>
              </Card>
              <Card className="p-3 md:p-6">
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  ) : (
                    <div className="text-lg md:text-2xl font-bold text-yellow-600">
                      {leadStats?.statusBreakdown?.find((s: any) => s._id === "contacted")?.count || 0}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-gray-600">Contacted</div>
                </div>
              </Card>
              <Card className="p-3 md:p-6">
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  ) : (
                    <div className="text-lg md:text-2xl font-bold text-green-600">
                      {leadStats?.statusBreakdown?.find((s: any) => s._id === "converted")?.count || 0}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-gray-600">Converted</div>
                </div>
              </Card>
              <Card className="p-3 md:p-6">
                <div className="text-center">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                  ) : (
                    <div className="text-lg md:text-2xl font-bold text-purple-600">
                      {leadStats?.conversionRate ? `${leadStats.conversionRate.toFixed(0)}%` : "0%"}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-gray-600">Response Rate</div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={statsPeriod}
                      onValueChange={(value) => {
                        setStatsPeriod(value)
                        fetchLeadStats()
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search leads..."
                        className="pl-10 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        fetchLeads()
                        fetchLeadStats()
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Leads List */}
            <div className="space-y-3 md:space-y-4">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredLeads.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Inbox className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? "Try adjusting your search or filters"
                        : filterStatus !== "all"
                          ? `No leads with status "${filterStatus}"`
                          : "You don't have any leads yet"}
                    </p>
                    {(searchQuery || filterStatus !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setFilterStatus("all")
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredLeads.map((lead) => (
                  <Card key={lead._id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm md:text-base truncate">
                              {getClientDisplayName(lead)}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600">
                              {lead.serviceType || "Photography Service"}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${statusColors[lead.status]}`}>
                                <span className="flex items-center">
                                  {statusIcons[lead.status]}
                                  <span className="ml-1">{lead.status}</span>
                                </span>
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${priorityColors[lead.priority]}`}>
                                <span className="flex items-center">
                                  {priorityIcons[lead.priority]}
                                  <span className="ml-1">{lead.priority}</span>
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm md:text-base font-semibold text-green-600">
                            {lead.budget ? formatBudget(lead.budget) : "Budget N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-3 text-xs md:text-sm text-gray-600">
                        {lead.eventDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            <span>{new Date(lead.eventDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {lead.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="truncate">{lead.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">{getClientPhone(lead)}</span>
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-gray-700 mb-3 line-clamp-2">{lead.message}</p>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                        <div className="flex space-x-2">
                          <Select value={lead.status} onValueChange={(value) => updateLeadStatus(lead._id, value)}>
                            <SelectTrigger className="h-8 text-xs w-[110px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={lead.priority} onValueChange={(value) => updateLeadPriority(lead._id, value)}>
                            <SelectTrigger className="h-8 text-xs w-[110px]">
                              <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs bg-transparent"
                            onClick={() => fetchLeadDetails(lead._id)}
                            disabled={leadDetailsLoading}
                          >
                            {leadDetailsLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </>
                            )}
                          </Button>

                          {lead.status === "new" && (
                            <Button
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setSelectedLead(lead)
                                setResponseDialogOpen(true)
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {!isLoading && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="hidden md:flex items-center space-x-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current page
                        return page === 1 || page === pagination.pages || Math.abs(page - pagination.page) <= 1
                      })
                      .map((page, index, array) => {
                        // Add ellipsis between non-consecutive pages
                        const showEllipsis = index > 0 && page - array[index - 1] > 1

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                            <Button
                              variant={pagination.page === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          </div>
                        )
                      })}
                  </div>
                  <div className="md:hidden text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Lead Detail View
          selectedLead && (
            <div className="space-y-6">
              {/* Back button (desktop) */}
              <div className="hidden md:block">
                <Button variant="ghost" className="mb-4" onClick={() => setViewMode("list")}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to leads
                </Button>
              </div>

              {/* Lead Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-semibold">{getClientDisplayName(selectedLead)}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge className={statusColors[selectedLead.status]}>
                            <span className="flex items-center">
                              {statusIcons[selectedLead.status]}
                              <span className="ml-1">{selectedLead.status}</span>
                            </span>
                          </Badge>
                          <Badge variant="outline" className={priorityColors[selectedLead.priority]}>
                            <span className="flex items-center">
                              {priorityIcons[selectedLead.priority]}
                              <span className="ml-1">{selectedLead.priority}</span>
                            </span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Created {format(new Date(selectedLead.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Select
                        value={selectedLead.status}
                        onValueChange={(value) => updateLeadStatus(selectedLead._id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedLead.priority}
                        onValueChange={(value) => updateLeadPriority(selectedLead._id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="default" onClick={() => setNoteDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Contact & Event Details */}
                <div className="space-y-6 md:col-span-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {selectedLead.partnerId?.phone
                            ? formatPhone(selectedLead.partnerId.phone)
                            : "Contact via message"}
                        </span>
                      </div>
                      {selectedLead.contactMethod && (
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            Preferred contact: {selectedLead.contactMethod.replace("_", " ")}
                          </span>
                        </div>
                      )}
                      {selectedLead.source && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Source: {selectedLead.source.replace("_", " ")}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedLead.serviceType && (
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.serviceType}</span>
                        </div>
                      )}
                      {selectedLead.eventDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{format(new Date(selectedLead.eventDate), "MMMM d, yyyy")}</span>
                        </div>
                      )}
                      {selectedLead.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedLead.location}</span>
                        </div>
                      )}
                      {selectedLead.budget && (
                        <div className="flex items-center space-x-2">
                          <Banknote className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatBudget(selectedLead.budget)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Message & Notes */}
                <div className="space-y-6 md:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Client Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedLead.message}</div>

                      {selectedLead.status === "new" && (
                        <Button className="mt-4 w-full sm:w-auto" onClick={() => setResponseDialogOpen(true)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Response
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Notes & Activity</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setNoteDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {selectedLead.notes && selectedLead.notes.length > 0 ? (
                        <div className="space-y-4">
                          {selectedLead.notes.map((note) => (
                            <div key={note._id} className="border-l-2 border-gray-200 pl-4">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-sm">Partner</div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(note.addedAt), "MMM d, yyyy 'at' h:mm a")}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{note.note}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p>No notes yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-transparent"
                            onClick={() => setNoteDialogOpen(true)}
                          >
                            Add first note
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Response</DialogTitle>
            <DialogDescription>
              Send a response to the client. This will be added as a note and update the lead status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Response</label>
              <Textarea
                placeholder="Thank you for your interest! I'd be happy to discuss your photography needs..."
                rows={6}
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)} disabled={responseLoading}>
              Cancel
            </Button>
            <Button onClick={sendResponse} disabled={responseLoading || !responseMessage.trim()}>
              {responseLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a note to this lead for your reference.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note</label>
              <Textarea
                ref={noteInputRef}
                placeholder="Add details, follow-up information, or reminders..."
                rows={4}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)} disabled={noteLoading}>
              Cancel
            </Button>
            <Button onClick={addNote} disabled={noteLoading || !newNote.trim()}>
              {noteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ——— helper component ——— */
function Inbox(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}
