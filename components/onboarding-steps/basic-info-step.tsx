"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, X } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"

export function BasicInfoStep() {
  const { partnerData, updateBasicInfo } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: partnerData.companyName || "",
    partnerType: partnerData.partnerType || "",
    experienceYears: partnerData.experienceYears || "",
    specializations: partnerData.specializations || [],
    socialLinks: partnerData.socialLinks || {
      website: "",
      instagram: "",
      facebook: "",
      x: "",
      pinterest: "",
      youtube: "",
    },
  })

  const specializationOptions = [
    { value: "wedding_photography", label: "Wedding Photography" },
    { value: "portrait_photography", label: "Portrait Photography" },
    { value: "event_photography", label: "Event Photography" },
    { value: "commercial_photography", label: "Commercial Photography" },
    { value: "fashion_photography", label: "Fashion Photography" },
    { value: "product_photography", label: "Product Photography" },
    { value: "wedding_videography", label: "Wedding Videography" },
    { value: "event_videography", label: "Event Videography" },
    { value: "commercial_videography", label: "Commercial Videography" },
    { value: "documentary_videography", label: "Documentary Videography" },
    { value: "music_video", label: "Music Video" },
    { value: "corporate_video", label: "Corporate Video" },
  ]

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSpecializationToggle = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateBasicInfo(formData)
    } catch (error) {
      console.error("Error updating basic info:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl text-gray-900">Basic Information</CardTitle>
        <p className="text-gray-600 text-sm sm:text-base">Tell us about your photography business</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-900">
              Company/Business Name *
            </Label>
            <Input
              id="companyName"
              placeholder="Enter your business name"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              required
              className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerType" className="text-sm font-medium text-gray-900">
              Partner Type *
            </Label>
            <Select value={formData.partnerType} onValueChange={(value) => handleInputChange("partnerType", value)}>
              <SelectTrigger className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                <SelectValue placeholder="Select partner type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo Photographer</SelectItem>
                <SelectItem value="studio">Photography Studio</SelectItem>
                <SelectItem value="firm">Photography Firm</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceYears" className="text-sm font-medium text-gray-900">
              Years of Experience *
            </Label>
            <Select
              value={formData.experienceYears.toString()}
              onValueChange={(value) => handleInputChange("experienceYears", Number.parseInt(value))}
            >
              <SelectTrigger className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3">3 years</SelectItem>
                <SelectItem value="4">4 years</SelectItem>
                <SelectItem value="5">5 years</SelectItem>
                <SelectItem value="6">6-10 years</SelectItem>
                <SelectItem value="10">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-900">Photography Specializations *</Label>
            <p className="text-xs sm:text-sm text-gray-600">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specializationOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.specializations.includes(option.value)}
                    onCheckedChange={() => handleSpecializationToggle(option.value)}
                    className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                  />
                  <Label htmlFor={option.value} className="text-sm cursor-pointer text-gray-700">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.specializations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.specializations.map((spec) => {
                  const option = specializationOptions.find((opt) => opt.value === spec)
                  return (
                    <Badge
                      key={spec}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      {option?.label}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleSpecializationToggle(spec)}
                      />
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-900">Social Links (Optional)</Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm text-gray-700">
                  Website
                </Label>
                <Input
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={formData.socialLinks.website}
                  onChange={(e) => handleInputChange("socialLinks.website", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm text-gray-700">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="@yourusername"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => handleInputChange("socialLinks.instagram", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-sm text-gray-700">
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="Your Facebook page"
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleInputChange("socialLinks.facebook", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="x" className="text-sm text-gray-700">
                  X (Twitter)
                </Label>
                <Input
                  id="x"
                  placeholder="@yourusername"
                  value={formData.socialLinks.x}
                  onChange={(e) => handleInputChange("socialLinks.x", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinterest" className="text-sm text-gray-700">
                  Pinterest
                </Label>
                <Input
                  id="pinterest"
                  placeholder="Your Pinterest profile"
                  value={formData.socialLinks.pinterest}
                  onChange={(e) => handleInputChange("socialLinks.pinterest", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-sm text-gray-700">
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="Your YouTube channel"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleInputChange("socialLinks.youtube", e.target.value)}
                  className="w-full border-gray-200 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={
                loading || !formData.companyName || !formData.partnerType || formData.specializations.length === 0
              }
              className="inline-flex items-center justify-center px-6 py-2 border-2 border-black bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Services"
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
