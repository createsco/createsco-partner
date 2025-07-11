"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  MapPin,
  FileText,
  ImageIcon,
  Star,
  Calendar,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  ExternalLink,
  Eye,
  ChevronLeft,
} from "lucide-react"
import { format } from "date-fns"

interface PartnerDetailsProps {
  partnerId: string
}

interface Document {
  _id: string
  docName: string
  fileUrl: string // Changed from docUrl to fileUrl
  status: "pending" | "approved" | "rejected"
  rejectionReason?: string
  reviewNotes?: string
  reviewedAt?: string
  reviewedBy?: {
    username: string
    email: string
  }
}

interface Partner {
  _id: string
  userId: {
    _id: string
    username: string
    email: string
    phone: any
    profilePic?: string
    address?: string
    createdAt: string
    emailVerified: boolean
    phoneVerified: boolean
  }
  companyName: string
  partnerType: string
  experienceYears: number
  specializations: string[]
  socialLinks: {
    website?: string
    instagram?: string
    facebook?: string
    x?: string
    pinterest?: string
    youtube?: string
  }
  services: Array<{
    _id: string
    name: string
    description: string
    basePrice: number
    priceUnit: string
    isActive?: boolean
  }>
  partnerLocations: Array<{
    city: string
    state: string
    coordinates?: {
      lat: number
      lng: number
    }
    pinCodesServed: string[]
  }>
  servingLocations: string[]
  locationPricing?: Record<string, number>
  portfolio: string[] // Array of URLs
  documents: Array<{
    _id: string
    docName: string
    fileUrl: string // Note: fileUrl not docUrl
    status: "pending" | "approved" | "rejected"
    rejectionReason?: string
    reviewNotes?: string
    reviewedAt?: string
    reviewedBy?: {
      username: string
      email: string
    }
  }>
  onboardingStatus: string
  verified: boolean
  verificationDate?: string
  verificationNotes?: string
  verifiedBy?: {
    username: string
    email: string
  }
  rejectionReason?: string
  rejectionNotes?: string
  rejectionDate?: string
  rejectedBy?: {
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface HistoryItem {
  type: string
  action: string
  date: string
  by?: {
    username: string
    email: string
  }
  documentName?: string
  reason?: string
  notes?: string
}

const formatPhone = (phone: any): string => {
  if (!phone) return "Not provided"
  if (typeof phone === "string") return phone
  if (typeof phone === "object" && phone.number) {
    return `${phone.countryCode || ""} ${phone.number}`.trim()
  }
  return "Invalid phone format"
}

export function PartnerDetails({ partnerId }: PartnerDetailsProps) {
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentAction, setDocumentAction] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [reason, setReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    fetchPartnerDetails()
    fetchVerificationHistory()
  }, [partnerId])

  const fetchPartnerDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching partner details for ID:", partnerId)
      const response = await apiClient.getPartnerDetails(partnerId)
      console.log("Partner details response:", response)

      if (response.success && response.data) {
        console.log("Partner data received:", response.data.partner)
        setPartner(response.data.partner)
      } else {
        throw new Error(response.message || "Failed to fetch partner details")
      }
    } catch (error: any) {
      console.error("Fetch partner details error:", error)
      setError(error.message || "An error occurred while fetching partner details")
    } finally {
      setLoading(false)
    }
  }

  const fetchVerificationHistory = async () => {
    try {
      const response = await apiClient.getVerificationHistory(partnerId)
      if (response.success && response.data) {
        setHistory(response.data.history)
      }
    } catch (error: any) {
      console.error("Fetch verification history error:", error)
    }
  }

  const handleVerifyPartner = async () => {
    try {
      setActionLoading(true)
      const response = await apiClient.verifyPartner(partnerId, notes)
      if (response.success) {
        setVerifyDialogOpen(false)
        setNotes("")
        fetchPartnerDetails()
        fetchVerificationHistory()
      } else {
        throw new Error(response.message || "Failed to verify partner")
      }
    } catch (error: any) {
      console.error("Verify partner error:", error)
      setError(error.message || "An error occurred while verifying partner")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectPartner = async () => {
    try {
      if (!reason) {
        setError("Rejection reason is required")
        return
      }

      setActionLoading(true)
      const response = await apiClient.rejectPartner(partnerId, reason, notes)
      if (response.success) {
        setRejectDialogOpen(false)
        setReason("")
        setNotes("")
        fetchPartnerDetails()
        fetchVerificationHistory()
      } else {
        throw new Error(response.message || "Failed to reject partner")
      }
    } catch (error: any) {
      console.error("Reject partner error:", error)
      setError(error.message || "An error occurred while rejecting partner")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDocumentAction = async () => {
    try {
      if (!selectedDocument) return

      if (documentAction === "reject" && !reason) {
        setError("Rejection reason is required")
        return
      }

      setActionLoading(true)

      let response
      if (documentAction === "approve") {
        response = await apiClient.approveDocument(partnerId, selectedDocument._id, notes)
      } else {
        response = await apiClient.rejectDocument(partnerId, selectedDocument._id, reason, notes)
      }

      if (response.success) {
        setDocumentDialogOpen(false)
        setSelectedDocument(null)
        setDocumentAction(null)
        setReason("")
        setNotes("")
        fetchPartnerDetails()
        fetchVerificationHistory()
      } else {
        throw new Error(response.message || `Failed to ${documentAction} document`)
      }
    } catch (error: any) {
      console.error("Document action error:", error)
      setError(error.message || "An error occurred while processing document")
    } finally {
      setActionLoading(false)
    }
  }

  const openDocumentDialog = (document: Document, action: "approve" | "reject") => {
    setSelectedDocument(document)
    setDocumentAction(action)
    setReason("")
    setNotes("")
    setDocumentDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      case "incomplete":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Clock className="mr-1 h-3 w-3" />
            Incomplete
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        )
    }
  }

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        )
    }
  }

  const formatSpecialization = (specialization: string) => {
    if (!specialization) return ""
    return specialization
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatPriceUnit = (unit: string) => {
    if (!unit) return ""
    switch (unit) {
      case "per_hour":
        return "Per Hour"
      case "per_day":
        return "Per Day"
      case "per_project":
        return "Per Project"
      default:
        return unit
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !partner) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error || "Partner not found"}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.push("/admin/partners")}>
            Back to Partners
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/partners")}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden xs:inline">Back</span>
              </Button>
              <h1 className="text-xl md:text-3xl font-bold truncate">{partner.companyName || "Unknown Company"}</h1>
              {getStatusBadge(partner.onboardingStatus)}
            </div>
            <p className="mt-1 text-xs md:text-sm text-gray-500">
              Partner ID: {partner._id.substring(0, 8)}... • Created: {format(new Date(partner.createdAt), "PPP")}
            </p>
          </div>

          {partner.onboardingStatus === "pending_verification" && (
            <div className="flex space-x-2">
              <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Verify Partner</span>
                    <span className="xs:hidden">Verify</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verify Partner</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to verify this partner? This will allow them to start receiving bookings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Verification Notes (Optional)
                      </label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about this verification"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button variant="outline" onClick={() => setVerifyDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleVerifyPartner}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Partner
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    size="sm"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Reject Partner</span>
                    <span className="xs:hidden">Reject</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Partner</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to reject this partner? They will need to fix issues and reapply.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="reason" className="text-sm font-medium">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="reason"
                        placeholder="Reason for rejection"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">
                        Additional Notes (Optional)
                      </label>
                      <Textarea
                        id="notes"
                        placeholder="Add any additional details about the rejection"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRejectPartner}
                      disabled={actionLoading || !reason}
                      variant="destructive"
                      className="w-full sm:w-auto"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Partner
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <ScrollArea className="w-full">
            <div className="inline-flex w-max space-x-1 border-b pb-1">
              <Button
                variant={activeTab === "details" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("details")}
                className="rounded-full"
              >
                Details
              </Button>
              <Button
                variant={activeTab === "documents" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("documents")}
                className="rounded-full"
              >
                Documents
              </Button>
              <Button
                variant={activeTab === "portfolio" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("portfolio")}
                className="rounded-full"
              >
                Portfolio
              </Button>
              <Button
                variant={activeTab === "services" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("services")}
                className="rounded-full"
              >
                Services
              </Button>
              <Button
                variant={activeTab === "locations" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("locations")}
                className="rounded-full"
              >
                Locations
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("history")}
                className="rounded-full"
              >
                History
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={partner.userId?.profilePic || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {partner.userId?.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{partner.userId?.username}</h3>
                      <p className="text-sm text-gray-500">User ID: {partner.userId?._id.substring(0, 8)}...</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm break-all">{partner.userId?.email}</span>
                      {partner.userId?.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{formatPhone(partner.userId?.phone)}</span>
                      {partner.userId?.phoneVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{partner.userId?.address || "Not provided"}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        Joined{" "}
                        {partner.userId?.createdAt ? format(new Date(partner.userId.createdAt), "PPP") : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company Name</p>
                    <p className="text-lg font-semibold">{partner.companyName}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Partner Type</p>
                    <Badge variant="outline">{partner.partnerType}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Experience</p>
                    <p>{partner.experienceYears} years</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Specializations</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {partner.specializations?.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {formatSpecialization(spec)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Social Links</p>
                    <div className="space-y-2">
                      {partner.socialLinks?.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a
                            href={partner.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center break-all"
                          >
                            Website <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                      {partner.socialLinks?.instagram && (
                        <div className="flex items-center space-x-2">
                          <Instagram className="h-4 w-4 text-gray-400" />
                          <a
                            href={partner.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center break-all"
                          >
                            Instagram <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                      {partner.socialLinks?.facebook && (
                        <div className="flex items-center space-x-2">
                          <Facebook className="h-4 w-4 text-gray-400" />
                          <a
                            href={partner.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center break-all"
                          >
                            Facebook <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner.documents && partner.documents.length > 0 ? (
                  <div className="space-y-4">
                    {partner.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                          <FileText className="h-8 w-8 text-gray-400 flex-shr ink-0 mt-1 md:mt-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{doc.docName}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {getDocumentStatusBadge(doc.status)}
                              {doc.reviewedAt && (
                                <span className="text-xs text-gray-500">
                                  Reviewed {format(new Date(doc.reviewedAt), "PPP")}
                                </span>
                              )}
                            </div>
                            {doc.rejectionReason && (
                              <p className="text-sm text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                            )}
                            {doc.reviewNotes && <p className="text-sm text-gray-600 mt-1">Notes: {doc.reviewNotes}</p>}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(doc.fileUrl, "_blank")}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          {doc.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                onClick={() => openDocumentDialog(doc, "approve")}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                                onClick={() => openDocumentDialog(doc, "reject")}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">No verification documents have been uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner.portfolio && partner.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {partner.portfolio.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setImagePreviewUrl(imageUrl)}
                      >
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=200&width=200"
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio images</h3>
                    <p className="mt-1 text-sm text-gray-500">No portfolio images have been uploaded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner.services && partner.services.length > 0 ? (
                  <div className="space-y-4">
                    {partner.services.map((service) => (
                      <div key={service._id} className="p-4 border rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h4 className="font-medium text-lg">{service.name}</h4>
                          <div className="flex items-center space-x-2 mt-2 md:mt-0">
                            <span className="text-lg font-semibold text-green-600">
                              ₹{service.basePrice.toLocaleString()}
                            </span>
                            <Badge variant="outline">{formatPriceUnit(service.priceUnit)}</Badge>
                            {service.isActive !== false && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
                    <p className="mt-1 text-sm text-gray-500">No services have been added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Service Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner.partnerLocations && partner.partnerLocations.length > 0 ? (
                  <div className="space-y-4">
                    {partner.partnerLocations.map((location, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium">
                            {location.city}, {location.state}
                          </h4>
                        </div>
                        {location.pinCodesServed && location.pinCodesServed.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Pin Codes Served:</p>
                            <div className="flex flex-wrap gap-2">
                              {location.pinCodesServed.map((pinCode, pinIndex) => (
                                <Badge key={pinIndex} variant="outline">
                                  {pinCode}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
                    <p className="mt-1 text-sm text-gray-500">No service locations have been added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Verification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history && history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={index} className="flex space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          {item.action === "verified" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {item.action === "rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                          {item.action === "document_approved" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {item.action === "document_rejected" && <XCircle className="h-5 w-5 text-red-500" />}
                          {!["verified", "rejected", "document_approved", "document_rejected"].includes(
                            item.action,
                          ) && <Clock className="h-5 w-5 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <p className="text-sm font-medium">
                              {item.type === "partner" && `Partner ${item.action}`}
                              {item.type === "document" && `Document ${item.action}`}
                              {item.documentName && `: ${item.documentName}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 md:mt-0">
                              {format(new Date(item.date), "PPP 'at' p")}
                            </p>
                          </div>
                          {item.by && (
                            <p className="text-xs text-gray-500 mt-1">
                              By: {item.by.username} ({item.by.email})
                            </p>
                          )}
                          {item.reason && <p className="text-sm text-red-600 mt-1">Reason: {item.reason}</p>}
                          {item.notes && <p className="text-sm text-gray-600 mt-1">Notes: {item.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No history</h3>
                    <p className="mt-1 text-sm text-gray-500">No verification history available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Document Action Dialog */}
        <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{documentAction === "approve" ? "Approve Document" : "Reject Document"}</DialogTitle>
              <DialogDescription>
                {selectedDocument && (
                  <>
                    Document: <strong>{selectedDocument.docName}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {documentAction === "reject" && (
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="reason"
                    placeholder="Reason for rejection"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  {documentAction === "approve" ? "Approval Notes (Optional)" : "Additional Notes (Optional)"}
                </label>
                <Textarea
                  id="notes"
                  placeholder={`Add any notes about this ${documentAction}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button variant="outline" onClick={() => setDocumentDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleDocumentAction}
                disabled={actionLoading || (documentAction === "reject" && !reason)}
                className={`w-full sm:w-auto ${
                  documentAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {documentAction === "approve" ? "Approving..." : "Rejecting..."}
                  </>
                ) : (
                  <>
                    {documentAction === "approve" ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {documentAction === "approve" ? "Approve Document" : "Reject Document"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={!!imagePreviewUrl} onOpenChange={() => setImagePreviewUrl(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Portfolio Image</DialogTitle>
            </DialogHeader>
            {imagePreviewUrl && (
              <div className="flex justify-center">
                <img
                  src={imagePreviewUrl || "/placeholder.svg"}
                  alt="Portfolio preview"
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </AdminLayout>
  )
}
