"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signIn, resendEmailVerification, reloadUser, isEmailVerified, getCurrentUser } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { PartnerHeader } from "@/components/partner-header"

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

interface ValidationErrors {
  email?: string
  phone?: string
  address?: string
  password?: string
}

interface FieldValidation {
  isValid: boolean
  message: string
}

export function PartnerLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"login" | "verify-email" | "basic-details" | "success">("login")
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const { user, refreshToken } = useAuth()

  // Basic details form state
  const [basicDetailsData, setBasicDetailsData] = useState({
    phone: {
      countryCode: "+91",
      number: "",
    },
    address: "",
    userType: "partner",
  })

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [fieldValidation, setFieldValidation] = useState<Record<string, FieldValidation>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // Add these state variables after the existing state
  const [loginFieldValidation, setLoginFieldValidation] = useState<Record<string, FieldValidation>>({})
  const [loginTouchedFields, setLoginTouchedFields] = useState<Record<string, boolean>>({})

  // Validation functions
  const validatePhone = (phone: { countryCode: string; number: string }): FieldValidation => {
    if (!phone.number) {
      return { isValid: false, message: "Phone number is required" }
    }
    if (!/^[0-9]{10}$/.test(phone.number)) {
      return { isValid: false, message: "Phone number must be exactly 10 digits" }
    }
    return { isValid: true, message: "Phone number looks good!" }
  }

  const validateAddress = (address: string): FieldValidation => {
    if (!address) {
      return { isValid: false, message: "Address is required" }
    }
    if (address.length < 10) {
      return { isValid: false, message: "Address must be at least 10 characters" }
    }
    if (address.length > 500) {
      return { isValid: false, message: "Address must not exceed 500 characters" }
    }
    return { isValid: true, message: "Address looks good!" }
  }

  // Add these validation functions after the existing validation functions
  const validateLoginEmail = (email: string): FieldValidation => {
    if (!email) {
      return { isValid: false, message: "Email is required" }
    }
    if (email.length > 254) {
      return { isValid: false, message: "Email is too long" }
    }
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" }
    }
    return { isValid: true, message: "Email looks good!" }
  }

  const validateLoginPassword = (password: string): FieldValidation => {
    if (!password) {
      return { isValid: false, message: "Password is required" }
    }
    if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters" }
    }
    return { isValid: true, message: "Password entered" }
  }

  // Redirect if already logged in
  const redirectIfLoggedIn = () => {
    if (user) {
      console.log("✅ User already logged in, redirecting to dashboard")
      // Use window.location.href for more reliable redirection on mobile
      window.location.href = "/partner/dashboard"
      return true
    }
    return false
  }

  useEffect(() => {
    if (redirectIfLoggedIn()) {
      return
    }
  }, [user])

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

  // Add helper functions
  const handleLoginBlur = (field: string) => {
    setLoginTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const getLoginInputClassName = (field: string, baseClassName: string) => {
    const validation = loginFieldValidation[field]
    const touched = loginTouchedFields[field]

    if (!touched || !validation) return baseClassName

    if (validation.isValid) {
      return `${baseClassName} border-green-300 focus:border-green-500 focus:ring-green-500`
    } else {
      return `${baseClassName} border-red-300 focus:border-red-500 focus:ring-red-500`
    }
  }

  const LoginFieldValidationIndicator = ({ field }: { field: string }) => {
    const validation = loginFieldValidation[field]
    if (!validation || !loginTouchedFields[field]) return null

    return (
      <div className={`flex items-center mt-1 text-xs ${validation.isValid ? "text-green-600" : "text-red-600"}`}>
        {validation.isValid ? <CheckCircle className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
        {validation.message}
      </div>
    )
  }

  const validateBasicDetailsForm = (): string | null => {
    const phoneValidation = validatePhone(basicDetailsData.phone)
    const addressValidation = validateAddress(basicDetailsData.address)

    if (!phoneValidation.isValid) return phoneValidation.message
    if (!addressValidation.isValid) return addressValidation.message

    return null
  }

  const isBasicDetailsFormValid = () => {
    const validationError = validateBasicDetailsForm()
    return !validationError
  }

  const FieldValidationIndicator = ({ field }: { field: string }) => {
    const validation = fieldValidation[field]
    if (!validation || !touchedFields[field]) return null

    return (
      <div className={`flex items-center mt-1 text-xs ${validation.isValid ? "text-green-600" : "text-red-600"}`}>
        {validation.isValid ? <CheckCircle className="h-3 w-3 mr-1" /> : <Mail className="h-3 w-3 mr-1" />}
        {validation.message}
      </div>
    )
  }

  // Add this useEffect after the existing useEffects
  useEffect(() => {
    const newValidation: Record<string, FieldValidation> = {}

    if (loginTouchedFields.email) {
      newValidation.email = validateLoginEmail(email)
    }
    if (loginTouchedFields.password) {
      newValidation.password = validateLoginPassword(password)
    }

    setLoginFieldValidation(newValidation)
  }, [email, password, loginTouchedFields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("🚀 Step 1: Firebase Authentication...")
      const authResult = await signIn(email, password)
      console.log("✅ Firebase authentication successful")

      if (!authResult.emailVerified) {
        console.log("❌ Email not verified - showing verification UI")
        setCurrentUser(authResult.user)
        setStep("verify-email")
        setLoading(false)
        return
      }

      console.log("✅ Email verified, checking backend registration...")
      setCurrentUser(authResult.user)
      await checkBackendRegistration(authResult.user)
    } catch (error: any) {
      console.error("❌ Login error:", error)
      setError(error.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkBackendRegistration = async (firebaseUser: any) => {
    try {
      console.log("🔍 Login: Step 1 - Checking if user exists in backend with /users/me...")
      const userResponse = await apiClient.getMe()
      console.log("📥 Login: Step 1 Response from /users/me:", userResponse)

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data.user
        console.log("✅ Login: Step 1 Success - User found in backend:", {
          id: userData.id,
          email: userData.email,
          userType: userData.userType,
          emailVerified: userData.emailVerified,
        })

        // STEP 2: Now check onboarding status with /partner-onboarding/status
        console.log("🔍 Login: Step 2 - Checking onboarding status with /partner-onboarding/status...")

        try {
          const onboardingResponse = await apiClient.getOnboardingStatus()
          console.log("📥 Login: Step 2 Response from /partner-onboarding/status:", onboardingResponse)

          if (onboardingResponse.success && onboardingResponse.data) {
            const onboardingData = onboardingResponse.data
            console.log("✅ Login: Step 2 Success - Onboarding data found:", {
              onboardingStatus: onboardingData.onboardingStatus,
              verificationStatus: onboardingData.verificationStatus,
            })

            // STEP 3: Route based on onboarding status
            console.log("🚦 Login: Step 3 - Routing based on status...")

            if (onboardingData.onboardingStatus === "incomplete") {
              console.log("🚀 Login: Onboarding incomplete → redirecting to /partner/onboarding")
              window.location.href = "/partner/onboarding"
              return
            }

            if (onboardingData.onboardingStatus === "pending_verification") {
              console.log("⏳ Login: Verification pending → redirecting to /partner/verification-pending")
              window.location.href = "/partner/verification-pending"
              return
            }

            if (onboardingData.onboardingStatus === "rejected") {
              console.log("❌ Login: Verification rejected → redirecting to /partner/verification-pending")
              window.location.href = "/partner/verification-pending"
              return
            }

            if (onboardingData.onboardingStatus === "verified") {
              console.log("✅ Login: Partner is verified → redirecting to dashboard")
              window.location.href = "/partner/dashboard"
              return
            }

            // Default case - redirect to dashboard
            console.log("✅ Login: Default case → redirecting to dashboard")
            window.location.href = "/partner/dashboard"
          } else {
            // STEP 2 FAILED: No onboarding data found
            console.log("⚠️ Login: Step 2 Failed - No onboarding data in response")
            console.log("📝 Login: Response was:", onboardingResponse)
            console.log("🚀 Login: Assuming user needs onboarding → redirecting to /partner/onboarding")
            window.location.href = "/partner/onboarding"
            return
          }
        } catch (onboardingError: any) {
          // STEP 2 ERROR: Onboarding status API failed
          console.error("❌ Login: Step 2 Error - Failed to get onboarding status:", onboardingError)
          console.log("📝 Login: Error details:", {
            message: onboardingError.message,
            stack: onboardingError.stack,
          })

          // Check if it's a 404 or not found error
          if (
            onboardingError.message.includes("404") ||
            onboardingError.message.includes("not found") ||
            onboardingError.message.includes("Not Found")
          ) {
            console.log("⚠️ Login: 404 Error - Partner onboarding record not found")
            console.log("🚀 Login: Redirecting to onboarding to create record")
            window.location.href = "/partner/onboarding"
            return
          }

          // For network errors, redirect to dashboard (let dashboard handle it)
          if (onboardingError.message.includes("Failed to fetch") || onboardingError.message.includes("CORS")) {
            console.log("⚠️ Login: Network error, redirecting to dashboard")
            window.location.href = "/partner/dashboard"
            return
          }

          // For other errors, throw to be handled by outer catch
          throw onboardingError
        }
      } else {
        // STEP 1 FAILED: User not found in backend
        console.log("⚠️ Login: Step 1 Failed - User not found in backend")
        console.log("📝 Login: Response was:", userResponse)
        console.log("🎨 Login: Showing basic details form")
        setStep("basic-details")
      }
    } catch (apiError: any) {
      // STEP 1 ERROR: /users/me API failed
      console.error("❌ Login: Step 1 Error - Failed to get user data:", apiError)
      console.log("📝 Login: Error details:", {
        message: apiError.message,
        stack: apiError.stack,
      })

      if (apiError.message.includes("404") || apiError.message.includes("User not found")) {
        console.log("⚠️ Login: User not found in backend, showing basic details form")
        setStep("basic-details")
        return
      }

      if (apiError.message.includes("Failed to fetch") || apiError.message.includes("CORS")) {
        console.log("⚠️ Login: Network error, redirecting to dashboard")
        window.location.href = "/partner/dashboard"
        return
      }

      throw apiError
    }
  }

  const handleResendVerification = async () => {
    setVerificationLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      console.log("📧 Resending verification email...")
      await resendEmailVerification()
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error: any) {
      console.error("❌ Failed to resend verification:", error)
      setError(error.message)
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setVerificationLoading(true)
    setError("")

    try {
      console.log("🔍 Checking email verification status...")
      await reloadUser()
      await refreshToken()

      if (isEmailVerified()) {
        console.log("✅ Email verified! Now checking backend registration...")
        setStep("basic-details")
      } else {
        setError("Email not yet verified. Please check your inbox and click the verification link.")
      }
    } catch (error: any) {
      console.error("❌ Failed to check verification:", error)
      setError(error.message)
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleBasicDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouchedFields({
      phone: true,
      address: true,
    })

    const validationError = validateBasicDetailsForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("🚀 Registering user in backend...")

      const firebaseUser = currentUser || user || getCurrentUser()

      if (!firebaseUser) {
        throw new Error("No user found. Please try logging in again.")
      }

      const userData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.email,
        phone: basicDetailsData.phone,
        address: basicDetailsData.address,
        userType: basicDetailsData.userType,
      }

      console.log("📤 Sending registration data:", userData)

      const response = await apiClient.register(userData)

      if (response.success) {
        console.log("✅ Backend registration successful, redirecting to onboarding")
        setStep("success")

        setTimeout(() => {
          console.log("���� Redirecting to onboarding...")
          window.location.href = "/partner/onboarding"
        }, 2000)
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      console.error("❌ Backend registration failed:", error)
      setError(error.message || "Failed to register user in backend")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Email verification UI
  if (step === "verify-email") {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerHeader />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600 text-sm">
                  We sent a verification link to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {resendSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">Verification email sent successfully!</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleCheckVerification}
                  disabled={verificationLoading}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {verificationLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </div>
                  ) : (
                    "I've verified my email"
                  )}
                </button>

                <button
                  onClick={handleResendVerification}
                  disabled={verificationLoading || resendSuccess}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {verificationLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </div>
                  ) : resendSuccess ? (
                    "Email sent!"
                  ) : (
                    "Resend email"
                  )}
                </button>

                <button
                  onClick={() => setStep("login")}
                  className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                >
                  Back to login
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Basic details UI
  if (step === "basic-details") {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerHeader />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h1>
                <p className="text-gray-600 text-sm">Just a few more details to get started</p>
              </div>

              <form onSubmit={handleBasicDetailsSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={currentUser?.email || email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-base md:text-sm"
                  />
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                  <div className="flex space-x-3">
                    <select
                      value={basicDetailsData.phone.countryCode}
                      onChange={(e) => handleBasicDetailsChange("phone.countryCode", e.target.value)}
                      className="px-0 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                      className="flex-1 w-full px-6 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                      maxLength={10}
                    />
                  </div>
                  <FieldValidationIndicator field="phone" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    placeholder="Enter your full address"
                    value={basicDetailsData.address}
                    onChange={(e) => handleBasicDetailsChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                  <FieldValidationIndicator field="address" />
                  <p className="text-xs text-gray-500 mt-1">{basicDetailsData.address.length}/500 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isBasicDetailsFormValid()}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing registration...
                    </div>
                  ) : (
                    "Complete registration"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Success UI
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerHeader />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Createsco!</h1>
              <p className="text-gray-600 text-sm mb-6">
                Your account has been created successfully. Redirecting to complete your profile...
              </p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add form validation check for login submit:
  const isLoginFormValid = () => {
    const emailValidation = validateLoginEmail(email)
    const passwordValidation = validateLoginPassword(password)
    return emailValidation.isValid && passwordValidation.isValid
  }

  // Step 1: Login UI (Main)
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
              <p className="text-gray-600 text-sm">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError("")
                  }}
                  onBlur={() => handleLoginBlur("email")}
                  required
                  className={getLoginInputClassName(
                    "email",
                    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                  )}
                />
                <LoginFieldValidationIndicator field="email" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError("")
                    }}
                    onBlur={() => handleLoginBlur("password")}
                    required
                    className={getLoginInputClassName(
                      "password",
                      "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  <LoginFieldValidationIndicator field="password" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/partner/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || !isLoginFormValid()}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">Don't have an account? </span>
                <Link
                  href="/partner/signup"
                  className="text-gray-900 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
