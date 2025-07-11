"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, LogOut } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { BasicInfoStep } from "./onboarding-steps/basic-info-step"
import { ServicesStep } from "./onboarding-steps/services-step"
import { LocationsStep } from "./onboarding-steps/locations-step"
import { PortfolioStep } from "./onboarding-steps/portfolio-step"
import { DocumentsStep } from "./onboarding-steps/documents-step"
import { CompletionStep } from "./onboarding-steps/completion-step"
import { signOut } from "@/lib/auth"

export function OnboardingFlow() {
  const { user, loading: authLoading } = useAuth()
  const { step, progress, onboardingStatus, loading, error } = useOnboarding()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/partner/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (onboardingStatus === "verified") {
      router.push("/partner/dashboard")
    } else if (onboardingStatus === "pending_verification") {
      router.push("/partner/verification-pending")
    }
  }, [onboardingStatus, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/partner/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-gray-400 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Loading your onboarding...</h3>
            <p className="text-gray-600">Please wait while we prepare your profile setup</p>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stepTitles = ["Basic Information", "Services", "Locations", "Portfolio", "Documents", "Complete"]

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep />
      case 2:
        return <ServicesStep />
      case 3:
        return <LocationsStep />
      case 4:
        return <PortfolioStep />
      case 5:
        return <DocumentsStep />
      case 6:
        return <CompletionStep />
      default:
        return <BasicInfoStep />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Landing Page Style */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900">Createsco</span>
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Partners</span>
            </Link>

            {/* Mobile Layout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 text-right">
                <div className="font-medium">
                  Step {step} of {stepTitles.length}
                </div>
                <div className="hidden sm:block text-xs text-gray-500">{stepTitles[step - 1]}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center px-3 py-2 border-2 border-black bg-white hover:bg-gray-50 text-black font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Step Title */}
          <div className="sm:hidden mt-2 text-sm text-gray-600 font-medium">{stepTitles[step - 1]}</div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section - Updated Design */}
          <Card className="mb-6 sm:mb-8 shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg sm:text-xl text-gray-900">Partner Onboarding</CardTitle>
              <div className="text-center text-gray-600 text-sm sm:text-base hidden sm:block">
                {stepTitles[step - 1]}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <Progress value={progress} className="w-full h-2 bg-gray-100" />
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Progress: {progress}%</span>
                  <span>
                    Step {step} of {stepTitles.length}
                  </span>
                </div>
              </div>

              {/* Step Indicators - Updated Colors */}
              <div className="mt-6 overflow-x-auto">
                <div className="flex items-center justify-center min-w-max px-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {stepTitles.map((title, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                            index + 1 <= step ? "bg-gray-900 text-white shadow-md" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < stepTitles.length - 1 && (
                          <div
                            className={`w-8 sm:w-16 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-colors ${
                              index + 1 < step ? "bg-gray-900" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Labels for Mobile */}
              <div className="mt-4 sm:hidden">
                <div className="flex justify-center">
                  <div className="text-xs text-gray-500 text-center max-w-xs">
                    {stepTitles.map((title, index) => (
                      <span key={index} className={index + 1 === step ? "font-medium text-gray-900" : ""}>
                        {index + 1 === step && title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display - Updated Design */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50 shadow-sm">
              <CardContent className="p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Current Step */}
          <div className="animate-in slide-in-from-right-5 duration-300">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}
