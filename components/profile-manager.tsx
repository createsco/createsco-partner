"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  Star,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Loader2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Upload,
  Camera,
  AlertCircle,
  Lock,
  Shield,
  Info,
} from "lucide-react"

// Partner types
const partnerTypes = [
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "photo_studio", label: "Photo Studio" },
  { value: "production_house", label: "Production House" },
  { value: "event_company", label: "Event Company" },
]

// Specializations
const specializations = [
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "event", label: "Event" },
  { value: "product", label: "Product" },
  { value: "fashion", label: "Fashion" },
  { value: "food", label: "Food" },
  { value: "real_estate", label: "Real Estate" },
  { value: "travel", label: "Travel" },
  { value: "sports", label: "Sports" },
  { value: "wildlife", label: "Wildlife" },
  { value: "aerial", label: "Aerial" },
  { value: "baby", label: "Baby" },
  { value: "maternity", label: "Maternity" },
  { value: "family", label: "Family" },
  { value: "corporate", label: "Corporate" },
]

// Price units
const priceUnits = [
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "per_project", label: "Per Project" },
]

export function ProfileManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [partnerData, setPartnerData] = useState<any>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)

  // Service form state - Updated to match backend validation
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    basePrice: 0,
    priceUnit: "per_hour",
  })

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    companyName: "",
    partnerType: "",
    experienceYears: 0,
    bio: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    specializations: [] as string[],
    socialLinks: {
      website: "",
      instagram: "",
      facebook: "",
      x: "",
      youtube: "",
    },
  })

  // Document upload state
  const [uploadingDocuments, setUploadingDocuments] = useState(false)

  // Portfolio upload state
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)

  // Check if partner is verified - Updated to match actual API response
  const isVerified = partnerData?.verified === true && partnerData?.onboardingStatus === "verified"
  const isPending =
    partnerData?.onboardingStatus === "pending_verification" ||
    partnerData?.onboardingStatus === "pending" ||
    (partnerData?.onboardingStep < 5 && !partnerData?.verified)
  const isRejected = partnerData?.onboardingStatus === "rejected"

  console.log("🔍 Verification Status Debug:", {
    verified: partnerData?.verified,
    onboardingStatus: partnerData?.onboardingStatus,
    onboardingStep: partnerData?.onboardingStep,
    isVerified,
    isPending,
    isRejected,
  })

  useEffect(() => {
    fetchPartnerProfile()
  }, [])

  useEffect(() => {
    // Calculate profile completion percentage
    if (partnerData) {
      let completedSections = 0
      const totalSections = 5 // Basic info, services, portfolio, documents, availability

      // Check basic info
      if (profileForm.companyName && profileForm.partnerType && profileForm.bio) {
        completedSections++
      }

      // Check services
      if (partnerData.services && partnerData.services.length > 0) {
        completedSections++
      }

      // Check portfolio
      if (partnerData.portfolio && partnerData.portfolio.length > 0) {
        completedSections++
      }

      // Check documents
      if (partnerData.documents && partnerData.documents.length > 0) {
        completedSections++
      }

      // Check availability (assuming it's always set to something)
      completedSections++

      setProfileCompletion(Math.round((completedSections / totalSections) * 100))
    }
  }, [partnerData, profileForm])

  const fetchPartnerProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching partner profile...")
      const response = await apiClient.getPartnerProfile()

      if (response.success && response.data) {
        console.log("✅ Partner profile fetched:", response.data.partner)
        console.log("🔍 Verification fields:", {
          verified: response.data.partner.verified,
          onboardingStatus: response.data.partner.onboardingStatus,
          onboardingStep: response.data.partner.onboardingStep,
        })
        setPartnerData(response.data.partner)

        // Initialize form with current data
        const partner = response.data.partner
        setProfileForm({
          companyName: partner.companyName || "",
          partnerType: partner.partnerType || "",
          experienceYears: partner.experienceYears || 0,
          bio: partner.bio || "",
          phone: partner.phone || "",
          address: partner.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          specializations: partner.specializations || [],
          socialLinks: {
            website: partner.socialLinks?.website || "",
            instagram: partner.socialLinks?.instagram || "",
            facebook: partner.socialLinks?.facebook || "",
            x: partner.socialLinks?.x || "",
            youtube: partner.socialLinks?.youtube || "",
          },
        })
      } else {
        throw new Error(response.message || "Failed to fetch profile data")
      }
    } catch (error: any) {
      console.error("❌ Error fetching partner profile:", error)
      setError(error.message || "An error occurred while fetching your profile")
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      console.log("💾 Updating partner profile:", profileForm)
      const response = await apiClient.updatePartnerProfile(profileForm)

      if (response.success) {
        console.log("✅ Profile updated successfully")
        setPartnerData(response.data.partner)
        setSuccess("Profile updated successfully")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(response.message || "Failed to update profile")
      }
    } catch (error: any) {
      console.error("❌ Error updating profile:", error)
      setError(error.message || "An error occurred while updating your profile")
    } finally {
      setSaving(false)
    }
  }

  const handleServiceFormChange = (field: string, value: any) => {
    setServiceForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      description: "",
      basePrice: 0,
      priceUnit: "per_hour",
    })
    setEditingService(null)
  }

  const openServiceDialog = (service: any = null) => {
    if (service) {
      setEditingService(service)
      setServiceForm({
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        priceUnit: service.priceUnit,
      })
    } else {
      resetServiceForm()
    }
    setServiceDialogOpen(true)
  }

  const handleServiceSubmit = async () => {
    try {
      setSaving(true)
      setError(null)

      // Prepare service data according to backend validation schema
      const serviceData = {
        name: serviceForm.name,
        description: serviceForm.description || undefined, // Optional field
        basePrice: serviceForm.basePrice,
        priceUnit: serviceForm.priceUnit,
      }

      console.log("📤 Service data being sent:", serviceData)

      let response

      if (editingService) {
        console.log("🔄 Updating service:", editingService._id, serviceData)
        response = await apiClient.updatePartnerService(editingService._id, serviceData)
      } else {
        console.log("➕ Adding new service:", serviceData)
        response = await apiClient.addPartnerService(serviceData)
      }

      if (response.success) {
        console.log("✅ Service operation successful")
        setPartnerData(response.data.partner)
        setServiceDialogOpen(false)
        resetServiceForm()
        setSuccess(`Service ${editingService ? "updated" : "added"} successfully`)

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(response.message || `Failed to ${editingService ? "update" : "add"} service`)
      }
    } catch (error: any) {
      console.error(`❌ Error ${editingService ? "updating" : "adding"} service:`, error)
      setError(error.message || `An error occurred while ${editingService ? "updating" : "adding"} the service`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      setSaving(true)
      setError(null)

      console.log("🗑️ Deleting service:", serviceId)
      const response = await apiClient.deletePartnerService(serviceId)

      if (response.success) {
        console.log("✅ Service deleted successfully")
        setPartnerData(response.data.partner)
        setSuccess("Service deleted successfully")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(response.message || "Failed to delete service")
      }
    } catch (error: any) {
      console.error("❌ Error deleting service:", error)
      setError(error.message || "An error occurred while deleting the service")
    } finally {
      setSaving(false)
    }
  }

  const handleSpecializationToggle = (specialization: string) => {
    setProfileForm((prev) => {
      const current = [...prev.specializations]

      if (current.includes(specialization)) {
        return {
          ...prev,
          specializations: current.filter((s) => s !== specialization),
        }
      } else {
        return {
          ...prev,
          specializations: [...current, specialization],
        }
      }
    })
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingDocuments(true)
      setError(null)

      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("documents", file)
      })

      console.log("📤 Uploading documents...")
      const response = await apiClient.uploadPartnerDocuments(formData)

      if (response.success) {
        console.log("✅ Documents uploaded successfully")
        // Refresh partner profile to get updated documents
        await fetchPartnerProfile()
        setSuccess("Documents uploaded successfully")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(response.message || "Failed to upload documents")
      }
    } catch (error: any) {
      console.error("❌ Error uploading documents:", error)
      setError(error.message || "An error occurred while uploading documents")
    } finally {
      setUploadingDocuments(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingPortfolio(true)
      setError(null)

      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("portfolio", file)
      })

      console.log("📤 Uploading portfolio images...")
      // Note: You'll need to add this endpoint to your API client
      const response = await apiClient.uploadPartnerPortfolio(formData)

      if (response.success) {
        console.log("✅ Portfolio images uploaded successfully")
        // Refresh partner profile to get updated portfolio
        await fetchPartnerProfile()
        setSuccess("Portfolio images uploaded successfully")

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        throw new Error(response.message || "Failed to upload portfolio images")
      }
    } catch (error: any) {
      console.error("❌ Error uploading portfolio:", error)
      setError(error.message || "An error occurred while uploading portfolio images")
    } finally {
      setUploadingPortfolio(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const getVerificationStatusBadge = () => {
    console.log("🎯 Badge Status Check:", { isVerified, isPending, isRejected, partnerData: partnerData })

    if (isVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Verified Partner
        </Badge>
      )
    } else if (isPending) {
      return (
        <Badge variant="secondary">
          <Loader2 className="mr-1 h-3 w-3" />
          Verification Pending
        </Badge>
      )
    } else if (isRejected) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Verification Rejected
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Info className="mr-1 h-3 w-3" />
          Not Verified
        </Badge>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Content */}
      <div className="px-4 py-6 md:px-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Verification Status Alert */}
          <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-gray-500" />
              <div>
                <h3 className="font-medium">Verification Status</h3>
                <p className="text-sm text-gray-500">Your current verification status</p>
              </div>
            </div>
            {getVerificationStatusBadge()}
          </div>

          {/* Verification Restrictions Alert */}
          {isVerified && (
            <Alert className="border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Account Verified:</strong> Your basic details and documents are now locked for security. You can
                still update your services and portfolio.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Services</span>
              </TabsTrigger>
              {/*<TabsTrigger value="portfolio" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Portfolio</span>
              </TabsTrigger>*/}
              <TabsTrigger value="documents" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Documents</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Basic Information
                    </div>
                    {isVerified && <Lock className="h-5 w-5 text-gray-400" />}
                  </CardTitle>
                  <CardDescription>
                    {isVerified
                      ? "Your basic information is locked after verification for security purposes"
                      : "Update your personal and company information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={partnerData?.userId?.profilePic || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {partnerData?.userId?.username?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-4 md:mt-0">
                      <h3 className="text-lg font-semibold">{partnerData?.userId?.username}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-4 w-4" />
                        <span>{partnerData?.userId?.email}</span>
                      </div>
                      <Button size="sm" variant="outline" className="mt-2 bg-transparent" disabled={isVerified}>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company/Business Name</Label>
                      <Input
                        id="companyName"
                        value={profileForm.companyName}
                        onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                        placeholder="Your business name"
                        disabled={isVerified}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerType">Partner Type</Label>
                      <Select
                        value={profileForm.partnerType}
                        onValueChange={(value) => setProfileForm({ ...profileForm, partnerType: value })}
                        disabled={isVerified}
                      >
                        <SelectTrigger id="partnerType">
                          <SelectValue placeholder="Select partner type" />
                        </SelectTrigger>
                        <SelectContent>
                          {partnerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="0"
                        max="100"
                        value={profileForm.experienceYears}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, experienceYears: Number.parseInt(e.target.value) || 0 })
                        }
                        disabled={isVerified}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Your contact number"
                        disabled={isVerified}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell clients about yourself and your photography services"
                      rows={4}
                      disabled={isVerified}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        placeholder="Street Address"
                        value={profileForm.address.street}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, street: e.target.value },
                          })
                        }
                        disabled={isVerified}
                      />
                      <Input
                        placeholder="City"
                        value={profileForm.address.city}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, city: e.target.value },
                          })
                        }
                        disabled={isVerified}
                      />
                      <Input
                        placeholder="State/Province"
                        value={profileForm.address.state}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, state: e.target.value },
                          })
                        }
                        disabled={isVerified}
                      />
                      <Input
                        placeholder="ZIP/Postal Code"
                        value={profileForm.address.zipCode}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, zipCode: e.target.value },
                          })
                        }
                        disabled={isVerified}
                      />
                      <Input
                        placeholder="Country"
                        value={profileForm.address.country}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, country: e.target.value },
                          })
                        }
                        disabled={isVerified}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec) => (
                        <Badge
                          key={spec.value}
                          variant={profileForm.specializations.includes(spec.value) ? "default" : "outline"}
                          className={`cursor-pointer ${isVerified ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => !isVerified && handleSpecializationToggle(spec.value)}
                        >
                          {spec.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Social Media Links</Label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <Input
                          placeholder="Website URL"
                          value={profileForm.socialLinks.website}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              socialLinks: { ...profileForm.socialLinks, website: e.target.value },
                            })
                          }
                          disabled={isVerified}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-gray-500" />
                        <Input
                          placeholder="Instagram URL"
                          value={profileForm.socialLinks.instagram}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              socialLinks: { ...profileForm.socialLinks, instagram: e.target.value },
                            })
                          }
                          disabled={isVerified}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Facebook className="h-5 w-5 text-gray-500" />
                        <Input
                          placeholder="Facebook URL"
                          value={profileForm.socialLinks.facebook}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              socialLinks: { ...profileForm.socialLinks, facebook: e.target.value },
                            })
                          }
                          disabled={isVerified}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Twitter className="h-5 w-5 text-gray-500" />
                        <Input
                          placeholder="X (Twitter) URL"
                          value={profileForm.socialLinks.x}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              socialLinks: { ...profileForm.socialLinks, x: e.target.value },
                            })
                          }
                          disabled={isVerified}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Youtube className="h-5 w-5 text-gray-500" />
                        <Input
                          placeholder="YouTube URL"
                          value={profileForm.socialLinks.youtube}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              socialLinks: { ...profileForm.socialLinks, youtube: e.target.value },
                            })
                          }
                          disabled={isVerified}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleProfileUpdate} disabled={saving || isVerified}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : isVerified ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Profile Locked
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Star className="mr-2 h-5 w-5" />
                      Services
                    </CardTitle>
                    <CardDescription>Manage the services you offer to clients</CardDescription>
                  </div>
                  <Button onClick={() => openServiceDialog()} size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent>
                  {partnerData?.services && partnerData.services.length > 0 ? (
                    <div className="space-y-4">
                      {partnerData.services.map((service: any) => (
                        <div
                          key={service._id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{service.name}</h3>
                              <Badge variant={service.isActive ? "default" : "secondary"}>
                                {service.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                            <p className="text-sm font-medium mt-1">
                              ₹{service.basePrice}{" "}
                              {service.priceUnit === "per_hour"
                                ? "per hour"
                                : service.priceUnit === "per_day"
                                  ? "per day"
                                  : "per project"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-3 md:mt-0">
                            <Button variant="outline" size="sm" onClick={() => openServiceDialog(service)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteService(service._id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>You haven't added any services yet</p>
                      <Button onClick={() => openServiceDialog()} className="mt-4" variant="outline">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Your First Service
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Dialog */}
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                    <DialogDescription>
                      {editingService
                        ? "Update the details of your existing service"
                        : "Add a new service to offer to your clients"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input
                        id="serviceName"
                        value={serviceForm.name}
                        onChange={(e) => handleServiceFormChange("name", e.target.value)}
                        placeholder="e.g. Wedding Photography"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription">Description (Optional)</Label>
                      <Textarea
                        id="serviceDescription"
                        value={serviceForm.description}
                        onChange={(e) => handleServiceFormChange("description", e.target.value)}
                        placeholder="Describe what this service includes"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="servicePrice">Base Price (₹)</Label>
                        <Input
                          id="servicePrice"
                          type="number"
                          min="0"
                          value={serviceForm.basePrice}
                          onChange={(e) => handleServiceFormChange("basePrice", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servicePriceUnit">Price Unit</Label>
                        <Select
                          value={serviceForm.priceUnit}
                          onValueChange={(value) => handleServiceFormChange("priceUnit", value)}
                        >
                          <SelectTrigger id="servicePriceUnit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priceUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleServiceSubmit} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingService ? (
                        "Update Service"
                      ) : (
                        "Add Service"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Portfolio Tab 
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Portfolio
                  </CardTitle>
                  <CardDescription>Showcase your best work to attract clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Your Portfolio</h3>
                      <div>
                        <input
                          type="file"
                          id="portfolio-upload"
                          multiple
                          accept="image/*"
                          onChange={handlePortfolioUpload}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => document.getElementById("portfolio-upload")?.click()}
                          disabled={uploadingPortfolio}
                        >
                          {uploadingPortfolio ? (
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Add Images
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {partnerData?.portfolio && partnerData.portfolio.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partnerData.portfolio.map((item: any) => (
                          <div key={item._id} className="relative group rounded-lg overflow-hidden">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="space-x-2">
                                <Button size="sm" variant="secondary">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                              <p className="text-white text-sm truncate">{item.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium mb-1">No portfolio images yet</h3>
                        <p className="text-gray-500 mb-4">Upload your best work to showcase to potential clients</p>
                        <Button onClick={() => document.getElementById("portfolio-upload")?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Images
                        </Button>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-amber-800">Portfolio Tips</h4>
                          <ul className="text-sm text-amber-700 mt-1 list-disc list-inside space-y-1">
                            <li>Upload high-quality images (at least 1920px wide)</li>
                            <li>Include a variety of your best work</li>
                            <li>Organize images into categories for easier browsing</li>
                            <li>Update your portfolio regularly with new work</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>*/}

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Upload className="mr-2 h-5 w-5" />
                      Verification Documents
                    </div>
                    {isVerified && <Lock className="h-5 w-5 text-gray-400" />}
                  </CardTitle>
                  <CardDescription>
                    {isVerified
                      ? "Your documents are locked after verification. Contact support if you need to update them."
                      : "Upload and manage your verification documents"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Upload Documents</h3>
                      <div>
                        <input
                          type="file"
                          id="document-upload"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleDocumentUpload}
                          className="hidden"
                          disabled={isVerified}
                        />
                        <Button
                          size="sm"
                          onClick={() => document.getElementById("document-upload")?.click()}
                          disabled={uploadingDocuments || isVerified}
                        >
                          {uploadingDocuments ? (
                            <>
                              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : isVerified ? (
                            <>
                              <Lock className="mr-1 h-4 w-4" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Upload Documents
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {partnerData?.documents && partnerData.documents.length > 0 ? (
                      <div className="space-y-4">
                        {partnerData.documents.map((doc: any) => (
                          <div key={doc._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded">
                                <Upload className="h-6 w-6 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium">{doc.docName}</p>
                                <div className="flex items-center mt-1">
                                  {doc.status === "approved" ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Approved
                                    </Badge>
                                  ) : doc.status === "rejected" ? (
                                    <Badge variant="destructive">
                                      <AlertCircle className="mr-1 h-3 w-3" />
                                      Rejected
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <Loader2 className="mr-1 h-3 w-3" />
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                {doc.rejectionReason && (
                                  <p className="text-sm text-red-600 mt-1">Reason: {doc.rejectionReason}</p>
                                )}
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => window.open(doc.fileUrl, "_blank")}>
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No documents uploaded yet</p>
                        <p className="text-sm mt-1">
                          Upload your business license, insurance, and other verification documents
                        </p>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-blue-800">Document Requirements</h4>
                          <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                            <li>Business license or registration certificate</li>
                            <li>Professional insurance certificate</li>
                            <li>Tax identification documents</li>
                            <li>Portfolio samples (if not uploaded separately)</li>
                            <li>Any relevant certifications or awards</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
