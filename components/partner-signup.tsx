"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, Mail, AlertCircle, Check, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { signUp, resendEmailVerification, reloadUser, isEmailVerified, getCurrentUser } from "@/lib/auth"
import { apiClient } from "@/lib/api"
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
  confirmPassword?: string
  terms?: string
}

interface FieldValidation {
  isValid: boolean
  message: string
}

export function PartnerSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Step 1: Email & Password
  const [emailPasswordData, setEmailPasswordData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  })

  // Step 3: Basic Details
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Track the current step in the signup flow
  const [step, setStep] = useState<"email-password" | "verify-email" | "basic-details" | "success">("email-password")
  const [userEmail, setUserEmail] = useState("")
  const [firebaseUser, setFirebaseUser] = useState<any>(null)

  // Real-time validation functions
  const validateEmail = (email: string): FieldValidation => {
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

  const validatePassword = (password: string): FieldValidation => {
    if (!password) {
      return { isValid: false, message: "Password is required" }
    }
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters" }
    }
    if (password.length > 128) {
      return { isValid: false, message: "Password is too long (max 128 characters)" }
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

    if (criteriaMet < 3) {
      return {
        isValid: false,
        message: "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters",
      }
    }

    if (criteriaMet === 4) {
      return { isValid: true, message: "Strong password!" }
    } else {
      return { isValid: true, message: "Good password" }
    }
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): FieldValidation => {
    if (!confirmPassword) {
      return { isValid: false, message: "Please confirm your password" }
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: "Passwords do not match" }
    }
    return { isValid: true, message: "Passwords match!" }
  }

  // Real-time validation effect for email & password step
  useEffect(() => {
    const newValidation: Record<string, FieldValidation> = {}

    if (touchedFields.email) {
      newValidation.email = validateEmail(emailPasswordData.email)
    }
    if (touchedFields.password) {
      newValidation.password = validatePassword(emailPasswordData.password)
    }
    if (touchedFields.confirmPassword) {
      newValidation.confirmPassword = validateConfirmPassword(
        emailPasswordData.password,
        emailPasswordData.confirmPassword,
      )
    }

    setFieldValidation(newValidation)
  }, [emailPasswordData, touchedFields])

  // Real-time validation effect for basic details step
  useEffect(() => {
    const newValidation: Record<string, FieldValidation> = {}

    if (touchedFields.phone) {
      newValidation.phone = validatePhone(basicDetailsData.phone)
    }
    if (touchedFields.address) {
      newValidation.address = validateAddress(basicDetailsData.address)
    }

    setFieldValidation(newValidation)
  }, [basicDetailsData, touchedFields])

  const handleEmailPasswordChange = (field: string, value: any) => {
    setEmailPasswordData((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    if (error) setError("")
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

  // Validate email & password form
  const validateEmailPasswordForm = (): string | null => {
    const emailValidation = validateEmail(emailPasswordData.email)
    const passwordValidation = validatePassword(emailPasswordData.password)
    const confirmPasswordValidation = validateConfirmPassword(
      emailPasswordData.password,
      emailPasswordData.confirmPassword,
    )

    if (!emailValidation.isValid) return emailValidation.message
    if (!passwordValidation.isValid) return passwordValidation.message
    if (!confirmPasswordValidation.isValid) return confirmPasswordValidation.message
    if (!emailPasswordData.termsAccepted) return "Please accept the terms and conditions"

    return null
  }

  // Validate basic details form
  const validateBasicDetailsForm = (): string | null => {
    const phoneValidation = validatePhone(basicDetailsData.phone)
    const addressValidation = validateAddress(basicDetailsData.address)

    if (!phoneValidation.isValid) return phoneValidation.message
    if (!addressValidation.isValid) return addressValidation.message

    return null
  }

  const isEmailPasswordFormValid = () => {
    const validationError = validateEmailPasswordForm()
    return !validationError
  }

  const isBasicDetailsFormValid = () => {
    const validationError = validateBasicDetailsForm()
    return !validationError
  }

  // Step 1: Firebase Auth - Create account with email/password
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouchedFields({
      email: true,
      password: true,
      confirmPassword: true,
    })

    const validationError = validateEmailPasswordForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("🚀 Step 1: Creating Firebase account...")
      const authUser = await signUp(emailPasswordData.email, emailPasswordData.password)
      console.log("✅ Firebase account created, verification email sent")

      setUserEmail(emailPasswordData.email)
      setFirebaseUser(authUser)
      setStep("verify-email")
    } catch (error: any) {
      console.error("❌ Firebase signup failed:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Email Verification - Check if email is verified
  const handleCheckEmailVerification = async () => {
    setLoading(true)
    setError("")

    try {
      console.log("🔍 Step 2: Checking email verification...")
      await reloadUser()

      if (isEmailVerified()) {
        console.log("✅ Email verified, proceeding to basic details collection")
        setStep("basic-details")
      } else {
        setError("Please verify your email first. Check your inbox and click the verification link.")
      }
    } catch (error: any) {
      console.error("❌ Email verification check failed:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Resend email verification if needed
  const handleResendVerification = async () => {
    try {
      console.log("📧 Resending verification email...")
      await resendEmailVerification()
      setError("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error("❌ Failed to resend verification:", error)
      setError(error.message)
    }
  }

  // Step 3: Basic Details - Collect and submit basic details
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
      console.log("🚀 Step 3: Registering user in backend...")

      const firebaseUser = getCurrentUser()
      if (!firebaseUser) {
        throw new Error("No user found. Please try signing up again.")
      }

      const registrationData = {
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.email,
        phone: basicDetailsData.phone,
        address: basicDetailsData.address,
        userType: basicDetailsData.userType,
      }

      console.log("📤 Registering user with backend:", registrationData)
      await apiClient.register(registrationData)
      console.log("✅ Backend registration successful")

      setStep("success")

      setTimeout(() => {
        console.log("🚀 Redirecting to onboarding...")
        router.push("/partner/onboarding")
      }, 2000)
    } catch (error: any) {
      console.error("❌ Backend registration failed:", error)
      setError(`Registration failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Helper component for field validation display
  const FieldValidationIndicator = ({ field }: { field: string }) => {
    const validation = fieldValidation[field]
    if (!validation || !touchedFields[field]) return null

    return (
      <div className={`flex items-center mt-1 text-xs ${validation.isValid ? "text-green-600" : "text-red-600"}`}>
        {validation.isValid ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
        {validation.message}
      </div>
    )
  }

  const getInputClassName = (field: string, baseClassName: string) => {
    const validation = fieldValidation[field]
    const touched = touchedFields[field]

    if (!touched || !validation) return baseClassName

    if (validation.isValid) {
      return `${baseClassName} border-green-300 focus:border-green-500 focus:ring-green-500`
    } else {
      return `${baseClassName} border-red-300 focus:border-red-500 focus:ring-red-500`
    }
  }

  // Step 2: Email Verification UI
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
                  We sent a verification link to <span className="font-medium text-gray-900">{userEmail}</span>
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">Verification email sent successfully!</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleCheckEmailVerification}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
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
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                >
                  Resend email
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

  // Step 3: Basic Details UI
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
                    value={userEmail}
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
                      className="px-3 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                      className="flex-1 w-full px-3 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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

  // Step 1: Email & Password UI (Initial Step)
  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600 text-sm">Join thousands of photographers on Createsco</p>
            </div>

            <form onSubmit={handleEmailPasswordSubmit} className="space-y-6">
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
                  value={emailPasswordData.email}
                  onChange={(e) => handleEmailPasswordChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={getInputClassName(
                    "email",
                    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:border-transparent",
                  )}
                  required
                />
                <FieldValidationIndicator field="email" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={emailPasswordData.password}
                    onChange={(e) => handleEmailPasswordChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={getInputClassName(
                      "password",
                      "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:border-transparent",
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FieldValidationIndicator field="password" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={emailPasswordData.confirmPassword}
                    onChange={(e) => handleEmailPasswordChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={getInputClassName(
                      "confirmPassword",
                      "w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:border-transparent",
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FieldValidationIndicator field="confirmPassword" />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={emailPasswordData.termsAccepted}
                  onChange={(e) => handleEmailPasswordChange("termsAccepted", e.target.checked)}
                  className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="#" className="text-gray-900 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-gray-900 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isEmailPasswordFormValid()}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>

              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <Link
                  href="/partner/login"
                  className="text-gray-900 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
