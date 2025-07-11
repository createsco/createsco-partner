"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Clock, CheckCircle, AlertCircle, FileText, MessageCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"

export function VerificationPending() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [partnerData, setPartnerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/partner/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return

      try {
        const response = await apiClient.getOnboardingStatus()
        if (response.success) {
          setPartnerData(response.data)

          // Redirect if status changed
          if (response.data.onboardingStatus === "verified") {
            router.push("/partner/dashboard")
          } else if (response.data.onboardingStatus === "incomplete") {
            router.push("/partner/onboarding")
          }
        }
      } catch (error) {
        console.error("Error fetching status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [user, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/partner/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !partnerData) {
    return null
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const documents = partnerData.profile?.documents || []
  const approvedDocs = documents.filter((doc: any) => doc.status === "approved").length
  const totalDocs = documents.length
  const verificationProgress = totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Createsco</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Verification Pending</Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Status Overview */}
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Verification in Progress</CardTitle>
              <p className="text-gray-600">
                Thank you for submitting your profile! Our team is reviewing your information and documents.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Verification Progress</span>
                  <span>{Math.round(verificationProgress)}% Complete</span>
                </div>
                <Progress value={verificationProgress} className="w-full" />
                <p className="text-center text-sm text-gray-600">
                  {approvedDocs} of {totalDocs} documents approved
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Profile Submitted</h4>
                    <p className="text-sm text-gray-600">Your profile has been successfully submitted for review</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Document Verification</h4>
                    <p className="text-sm text-gray-600">Our team is verifying your uploaded documents</p>
                    <p className="text-xs text-gray-500">In Progress (2-4 hours)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Portfolio Review</h4>
                    <p className="text-sm text-gray-600">Quality assessment of your portfolio images</p>
                    <p className="text-xs text-gray-500">Pending (12-24 hours)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Final Approval</h4>
                    <p className="text-sm text-gray-600">Final review and account activation</p>
                    <p className="text-xs text-gray-500">Pending (24-48 hours)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle>Document Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(doc.status)}
                      <div>
                        <h4 className="font-medium">{doc.docName}</h4>
                        {doc.reviewNotes && <p className="text-sm text-gray-600">{doc.reviewNotes}</p>}
                        {doc.rejectionReason && <p className="text-sm text-red-600">Reason: {doc.rejectionReason}</p>}
                      </div>
                    </div>
                    <Badge className={getDocumentStatusColor(doc.status)}>{doc.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <MessageCircle className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Contact Support</h4>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about the verification process or need to update your documents, our
                    support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Email:</strong> partner-support@Createsco.com
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> +91 1800-123-4567
                    </p>
                    <p className="text-sm">
                      <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/partner/onboarding">Edit Profile</Link>
            </Button>
            <Button asChild>
              <Link href="mailto:partner-support@Createsco.com">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
