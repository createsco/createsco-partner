"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"

export function CompletionStep() {
  const { partnerData, completeOnboarding, goToStep } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmitForVerification = async () => {
    setLoading(true)

    try {
      await completeOnboarding()
      router.push("/partner/verification-pending")
    } catch (error) {
      console.error("Error completing onboarding:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompletionStatus = () => {
    const hasBasicInfo = partnerData.companyName && partnerData.partnerType
    const hasServices = partnerData.services && partnerData.services.length > 0
    const hasLocations = partnerData.partnerLocations && partnerData.partnerLocations.length > 0
    const hasPortfolio = partnerData.portfolio && partnerData.portfolio.length > 0
    const hasDocuments = partnerData.documents && partnerData.documents.length > 0

    return {
      basicInfo: hasBasicInfo,
      services: hasServices,
      locations: hasLocations,
      portfolio: hasPortfolio,
      documents: hasDocuments,
      allComplete: hasBasicInfo && hasServices && hasLocations && hasPortfolio && hasDocuments,
    }
  }

  const status = getCompletionStatus()

  const sections = [
    {
      title: "Basic Information",
      completed: status.basicInfo,
      step: 1,
      details: partnerData.companyName ? `${partnerData.companyName} • ${partnerData.partnerType}` : "Not completed",
    },
    {
      title: "Services",
      completed: status.services,
      step: 2,
      details: partnerData.services ? `${partnerData.services.length} services added` : "No services added",
    },
    {
      title: "Locations",
      completed: status.locations,
      step: 3,
      details: partnerData.partnerLocations ? `${partnerData.partnerLocations.length} locations` : "No locations added",
    },
    {
      title: "Portfolio",
      completed: status.portfolio,
      step: 4,
      details: partnerData.portfolio ? `${partnerData.portfolio.length} images uploaded` : "No portfolio images",
    },
    {
      title: "Documents",
      completed: status.documents,
      step: 5,
      details: partnerData.documents ? `${partnerData.documents.length} documents uploaded` : "No documents uploaded",
    },
  ]

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Review & Submit</CardTitle>
        <p className="text-gray-600">Review your information and submit for verification</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion Status */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Onboarding Progress</h3>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {section.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                    <p className="text-sm text-gray-600">{section.details}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={section.completed ? "default" : "destructive"}
                    className={section.completed ? "bg-green-100 text-green-800" : ""}
                  >
                    {section.completed ? "Complete" : "Incomplete"}
                  </Badge>
                  {!section.completed && (
                    <button
                      onClick={() => goToStep(section.step)}
                      className="inline-flex items-center justify-center px-3 py-1 border-2 border-black bg-white hover:bg-gray-50 text-black font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {status.allComplete && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Ready for Verification!</h3>
                <p className="text-green-800 mb-4">
                  Your profile is complete and ready to be submitted for verification. Our team will review your
                  information and documents within 24-48 hours.
                </p>
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Document verification (2-4 hours)</li>
                    <li>Portfolio quality review (12-24 hours)</li>
                    <li>Background verification (24-48 hours)</li>
                    <li>Account activation and welcome email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incomplete Warning */}
        {!status.allComplete && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Profile Incomplete</h3>
                <p className="text-amber-800 mb-4">
                  Please complete all sections before submitting for verification. Click the "Edit" buttons above to
                  complete the missing sections.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-900">Terms & Conditions</h4>
          <p className="text-sm text-gray-600 mb-3">By submitting your profile for verification, you agree to:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Provide accurate and truthful information</li>
            <li>Maintain professional standards in all client interactions</li>
            <li>Comply with Createsco's partner guidelines and policies</li>
            <li>Pay applicable platform fees as per the partner agreement</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => goToStep(5)}
            className="inline-flex items-center justify-center px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 text-black font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Back
          </button>
          <button
            onClick={handleSubmitForVerification}
            disabled={loading || !status.allComplete}
            className="inline-flex items-center justify-center px-6 py-2 border-2 border-green-600 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
