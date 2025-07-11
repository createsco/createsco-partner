"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { PartnerDashboard } from "@/components/partner-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Loader2, CheckCircle, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { resendEmailVerification, waitForEmailVerification } from "@/lib/auth"

// Common country codes
const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
]

export default function DashboardPage() {
  const { user, loading: authLoading, emailVerified, refreshToken, reloadUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userData, setUserData] = useState<{
    _id: string
    id: string
    firebaseUid: string
    email: string
    username: string
    phone: {
      countryCode: string
      number: string
    }
    fullPhone: string
    emailVerified: boolean
    phoneVerified: boolean
    profilePic: string | null
    address: string
    userType: string
    planId: string | null
    lastLoginAt: string
    isActive: boolean
    deletedAt: string | null
    createdAt: string
    updatedAt: string
    notificationPreferences: {
      email: boolean
      sms: boolean
      push: boolean
    }
  } | null>(null)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [showBackendRegistration, setShowBackendRegistration] = useState(false)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Basic details form state
  const [basicDetailsData, setBasicDetailsData] = useState({
    phone: {
      countryCode: "+91",
      number: "",
    },
    address: "",
    userType: "partner",
  })

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    console.log("🔄 Dashboard: Auth state changed", {
      authLoading,
      user: user?.email,
      emailVerified,
    })

    if (!authLoading) {
      if (!user) {
        console.log("❌ Dashboard: No user, redirecting to login")
        router.push("/partner/login")
        return
      }

      if (!emailVerified) {
        console.log("❌ Dashboard: Email not verified, showing verification UI")
        setLoading(false)
        return
      }

      console.log("✅ Dashboard: Email verified, checking user status...")
      checkUserStatus()
    }
  }, [user, authLoading, emailVerified, router])

  // Validation functions
  const validatePhone = (phone: { countryCode: string; number: string }): boolean => {
    return phone.number.length === 10 && /^[0-9]{10}$/.test(phone.number)
  }

  const validateAddress = (address: string): boolean => {
    return address.length >= 10 && address.length <= 500
  }

  const handleBasicDetailsChange = (field: string, value: any) => {
    if (field.startsWith("phone.")) {
      const phoneField = field.split(".")[1]
      setBasicDetailsData((prev) => ({
        ...prev,
        phone: {
          ...prev.phone,
          [phoneField]: value,
        },
      }))
      setTouchedFields((prev) => ({ ...prev, phone: true }))
    } else {
      setBasicDetailsData((prev) => ({ ...prev, [field]: value }))
      setTouchedFields((prev) => ({ ...prev, [field]: true }))
    }

    if (error) setError("")
  }

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const isFormValid = () => {
    return validatePhone(basicDetailsData.phone) && validateAddress(basicDetailsData.address)
  }

  const checkUserStatus = async () => {
    try {
      console.log("🔍 Dashboard: Step 1 - Checking user status with /users/me...")
      setLoading(true)
      setError("")

      // STEP 1: Get user data from /users/me
      const userResponse = await apiClient.getMe()
      console.log("📥 Dashboard: Step 1 Response from /users/me:", userResponse)

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data.user
        console.log("✅ Dashboard: Step 1 Success - User found in backend:", {
          id: userData.id,
          email: userData.email,
          userType: userData.userType,
          emailVerified: userData.emailVerified,
        })
        setUserData(userData)

        // STEP 2: Now check onboarding status with /partner-onboarding/status
        console.log("🔍 Dashboard: Step 2 - Checking onboarding status with /partner-onboarding/status...")

        try {
          const onboardingResponse = await apiClient.getOnboardingStatus()
          console.log("📥 Dashboard: Step 2 Response from /partner-onboarding/status:", onboardingResponse)

          if (onboardingResponse.success && onboardingResponse.data) {
            const onboardingData = onboardingResponse.data
            console.log("✅ Dashboard: Step 2 Success - Onboarding data found:", {
              onboardingStatus: onboardingData.onboardingStatus,
              verificationStatus: onboardingData.verificationStatus,
              onboardingStep: onboardingData.onboardingStep,
              onboardingProgress: onboardingData.onboardingProgress,
            })
            setOnboardingData(onboardingData)

            // STEP 3: Route based on onboarding status - FIXED LOGIC
            console.log("🚦 Dashboard: Step 3 - Routing based on status...")
            console.log("🔍 Dashboard: Current onboarding status:", onboardingData.onboardingStatus)

            // Check for incomplete onboarding first
            if (onboardingData.onboardingStatus === "incomplete") {
              console.log("🚀 Dashboard: Onboarding incomplete → redirecting to /partner/onboarding")
              window.location.href = "/partner/onboarding"
              return
            }

            // Check for pending verification - THIS WAS THE MISSING LOGIC
            if (onboardingData.onboardingStatus === "pending_verification") {
              console.log(
                "⏳ Dashboard: Onboarding pending verification → redirecting to /partner/verification-pending",
              )
              router.push("/partner/verification-pending")
              return
            }

            // Check for rejected verification
            if (onboardingData.onboardingStatus === "rejected") {
              console.log("❌ Dashboard: Verification rejected → redirecting to /partner/verification-pending")
              router.push("/partner/verification-pending")
              return
            }

            // Only allow dashboard access if verified
            if (onboardingData.onboardingStatus === "verified") {
              console.log("✅ Dashboard: Partner is verified → showing main dashboard")
              setLoading(false)
              return
            }

            // If we reach here, it's an unknown status - redirect to verification pending for safety
            console.log("⚠️ Dashboard: Unknown onboarding status:", onboardingData.onboardingStatus)
            console.log("🚀 Dashboard: Redirecting to verification pending for safety")
            router.push("/partner/verification-pending")
            return
          } else {
            // STEP 2 FAILED: No onboarding data found
            console.log("⚠️ Dashboard: Step 2 Failed - No onboarding data in response")
            console.log("📝 Dashboard: Response was:", onboardingResponse)
            console.log("🚀 Dashboard: Assuming user needs onboarding → redirecting to /partner/onboarding")
            window.location.href = "/partner/onboarding"
            return
          }
        } catch (onboardingError: any) {
          // STEP 2 ERROR: Onboarding status API failed
          console.error("❌ Dashboard: Step 2 Error - Failed to get onboarding status:", onboardingError)
          console.log("📝 Dashboard: Error details:", {
            message: onboardingError.message,
            stack: onboardingError.stack,
          })

          // Check if it's a 404 or not found error
          if (
            onboardingError.message.includes("404") ||
            onboardingError.message.includes("not found") ||
            onboardingError.message.includes("Not Found")
          ) {
            console.log("⚠️ Dashboard: 404 Error - Partner onboarding record not found")
            console.log("🚀 Dashboard: Redirecting to onboarding to create record")
            window.location.href = "/partner/onboarding"
            return
          }

          // For other errors, show error message but don't redirect
          console.log("❌ Dashboard: Other error occurred, showing error to user")
          setError(`Failed to check onboarding status: ${onboardingError.message}`)
          setLoading(false)
        }
      } else {
        // STEP 1 FAILED: User not found in backend
        console.log("⚠️ Dashboard: Step 1 Failed - User not found in backend")
        console.log("📝 Dashboard: Response was:", userResponse)
        console.log("🎨 Dashboard: Showing backend registration UI")
        setShowBackendRegistration(true)
        setLoading(false)
      }
    } catch (error: any) {
      // STEP 1 ERROR: /users/me API failed
      console.error("❌ Dashboard: Step 1 Error - Failed to get user data:", error)
      console.log("📝 Dashboard: Error details:", {
        message: error.message,
        stack: error.stack,
      })

      // Check if it's a 404 or user not found error
      if (
        error.message.includes("404") ||
        error.message.includes("401") || // Unauthorized
        error.message.toLowerCase().includes("unauthorized") ||
        error.message.includes("User not found") ||
        error.message.includes("Network Error") ||
        error.message.includes("Failed to fetch")
      ) {
        console.log("⚠️ Dashboard: User not found or network error")
        console.log("🎨 Dashboard: Showing backend registration UI")
        setShowBackendRegistration(true)
        setLoading(false)
        return
      }

      // For other errors, show error message
      console.log("❌ Dashboard: Showing error to user")
      setError(error.message || "Failed to load user data")
      setLoading(false)
    }
  }

  const handleBackendRegistration = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    console.log("🚀 Dashboard: Starting backend registration...")
    console.log("📝 Dashboard: Form data:", basicDetailsData)

    // Mark all fields as touched for validation
    setTouchedFields({
      phone: true,
      address: true,
    })

    // Validate form
    if (!isFormValid()) {
      if (!validatePhone(basicDetailsData.phone)) {
        setError("Please enter a valid 10-digit phone number")
      } else if (!validateAddress(basicDetailsData.address)) {
        setError("Address must be between 10-500 characters")
      }
      return
    }

    setRegistrationLoading(true)
    setError("")

    try {
      if (!user) {
        throw new Error("No user found. Please try logging in again.")
      }

      // Prepare user data for backend registration
      const userData = {
        firebaseUid: user.uid,
        email: user.email,
        username: user.email || "user",
        phone: basicDetailsData.phone,
        address: basicDetailsData.address,
        userType: "partner",
      }

      console.log("📤 Dashboard: Sending registration data:", userData)

      const response = await apiClient.register(userData)
      console.log("📥 Dashboard: Registration response:", response)

      if (response.success) {
        console.log("✅ Dashboard: Backend registration successful, redirecting to onboarding")
        // Small delay to ensure backend processing
        setTimeout(() => {
          window.location.href = "/partner/onboarding"
        }, 1000)
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      console.error("❌ Dashboard: Backend registration failed:", error)
      setError(error.message || "Failed to register user in backend")
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setVerificationLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      console.log("📧 Dashboard: Resending verification email...")
      await resendEmailVerification()
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error: any) {
      console.error("❌ Dashboard: Failed to resend verification:", error)
      setError(error.message)
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setVerificationLoading(true)
    setError("")

    try {
      console.log("🔍 Dashboard: Checking email verification status...")

      // Wait for verification with timeout
      const isVerified = await waitForEmailVerification(10) // Wait up to 10 seconds

      if (isVerified) {
        console.log("✅ Dashboard: Email verification confirmed!")
        await refreshToken()
        // The useEffect will handle the redirect when emailVerified changes
      } else {
        setError("Email verification not detected. Please check your email and try again.")
      }
    } catch (error: any) {
      console.error("❌ Dashboard: Failed to check verification:", error)
      setError(error.message)
    } finally {
      setVerificationLoading(false)
    }
  }

  // Debug logging
  console.log("🔍 Dashboard: Current state", {
    authLoading,
    loading,
    emailVerified,
    showBackendRegistration,
    userData: !!userData,
    onboardingData: onboardingData
      ? {
          onboardingStatus: onboardingData.onboardingStatus,
          verificationStatus: onboardingData.verificationStatus,
        }
      : null,
    error,
  })

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
          {userData && <p className="text-sm text-gray-500 mt-2">Checking onboarding status...</p>}
        </div>
      </div>
    )
  }

  // Show email verification prompt if email not verified
  if (user && !emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Createsco</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Verify Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Please verify your email address to continue.</p>
                <p className="font-semibold text-gray-900 bg-gray-50 p-2 rounded border">{user.email}</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {resendSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Verification email sent successfully! Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button onClick={handleCheckVerification} disabled={verificationLoading} className="w-full">
                  {verificationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking verification...
                    </>
                  ) : (
                    "I've Verified My Email"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  disabled={verificationLoading || resendSuccess}
                  className="w-full bg-transparent"
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendSuccess ? (
                    "Email Sent!"
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>

                <Button variant="ghost" onClick={() => router.push("/partner/login")} className="w-full">
                  Back to Login
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">Check your spam folder if you don't see the email</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show backend registration UI if user not found in backend
  if (showBackendRegistration) {
    console.log("🎨 Dashboard: Rendering backend registration form")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <Camera className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Createsco</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Complete Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Your email has been verified.</p>
                <p className="text-sm text-gray-500">
                  Please provide additional details to complete your account setup.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleBackendRegistration} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-base md:text-sm"
                  />
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <div className="flex space-x-3">
                    <select
                      value={basicDetailsData.phone.countryCode}
                      onChange={(e) => handleBasicDetailsChange("phone.countryCode", e.target.value)}
                      className="px-0 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={basicDetailsData.phone.number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                        handleBasicDetailsChange("phone.number", value)
                      }}
                      onBlur={() => handleBlur("phone")}
                      className={`flex-1 w-full px-3 py-3 border rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        touchedFields.phone && !validatePhone(basicDetailsData.phone)
                          ? "border-red-300 bg-red-50"
                          : touchedFields.phone && validatePhone(basicDetailsData.phone)
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300"
                      }`}
                      required
                      maxLength={10}
                    />
                  </div>
                  {touchedFields.phone && (
                    <div
                      className={`flex items-center mt-1 text-xs ${
                        validatePhone(basicDetailsData.phone) ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {validatePhone(basicDetailsData.phone) ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Phone number looks good!
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Please enter a valid 10-digit phone number
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address *
                  </label>
                  <textarea
                    placeholder="Enter your full address"
                    value={basicDetailsData.address}
                    onChange={(e) => handleBasicDetailsChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    className={`w-full px-4 py-3 border rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      touchedFields.address && !validateAddress(basicDetailsData.address)
                        ? "border-red-300 bg-red-50"
                        : touchedFields.address && validateAddress(basicDetailsData.address)
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300"
                    }`}
                    required
                    rows={3}
                    maxLength={500}
                  />
                  {touchedFields.address && (
                    <div
                      className={`flex items-center mt-1 text-xs ${
                        validateAddress(basicDetailsData.address) ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {validateAddress(basicDetailsData.address) ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Address looks good!
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Address must be between 10-500 characters
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{basicDetailsData.address.length}/500 characters</p>
                </div>

                <Button type="submit" disabled={registrationLoading || !isFormValid()} className="w-full">
                  {registrationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up account...
                    </>
                  ) : (
                    "Complete Account Setup"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-gray-500">This will redirect you to the onboarding process</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Show main dashboard - THIS SHOULD ONLY BE REACHED IF onboardingStatus === "verified"
  console.log("🎨 Dashboard: Rendering main dashboard - user should be verified")
  return <PartnerDashboard />
}
