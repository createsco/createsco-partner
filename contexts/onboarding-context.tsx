"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "./auth-context"

interface OnboardingContextType {
  step: number
  progress: number
  onboardingStatus: string
  partnerData: unknown
  loading: boolean
  error: string | null
  goToStep: (step: number) => void
  updateBasicInfo: (data: unknown) => Promise<void>
  addService: (data: unknown) => Promise<void>
  updateLocations: (data: unknown) => Promise<void>
  uploadPortfolio: (urls: string[]) => Promise<void>
  uploadDocuments: (urls: string[], docNames: string[]) => Promise<void>
  completeOnboarding: () => Promise<void>
  refreshStatus: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}

interface OnboardingProviderProps {
  children: ReactNode
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [onboardingStatus, setOnboardingStatus] = useState("incomplete")
  const [partnerData, setPartnerData] = useState<unknown>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const refreshStatus = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getOnboardingStatus()

      if (response.success && response.data) {
        setStep(response.data.onboardingStep || 1)
        setProgress(response.data.onboardingProgress || 0)
        setOnboardingStatus(response.data.onboardingStatus || "incomplete")
        setPartnerData(response.data.profile || {})
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      console.error("Error fetching onboarding status:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [user])

  const goToStep = (newStep: number) => {
    setStep(newStep)
  }

  const updateBasicInfo = async (data: unknown) => {
    try {
      setError(null)
      const response = await apiClient.updateBasicInfo(data)

      if (response.success) {
        setPartnerData(response.data?.partner || {})
        setProgress(response.data?.onboardingProgress || progress)
        setStep(2) // Move to next step
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  const addService = async (data: unknown) => {
    try {
      setError(null)
      const response = await apiClient.addService(data)

      if (response.success) {
        setPartnerData(response.data?.partner || {})
        setProgress(response.data?.onboardingProgress || progress)
        // Refresh to get updated services list
        await refreshStatus()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  const updateLocations = async (data: unknown) => {
    try {
      setError(null)
      const response = await apiClient.updateLocations(data)

      if (response.success) {
        setPartnerData(response.data?.partner || {})
        setProgress(response.data?.onboardingProgress || progress)
        setStep(4) // Move to next step
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  const uploadPortfolio = async (urls: string[]) => {
    try {
      setError(null)
      console.log("📤 Sending portfolio URLs to backend:", urls)

      const response = await apiClient.uploadPortfolio(urls)

      if (response.success) {
        setPartnerData(response.data?.partner || {})
        setProgress(response.data?.onboardingProgress || progress)
        setStep(5) // Move to next step
        console.log("✅ Portfolio URLs saved to backend successfully")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      console.error("❌ Error saving portfolio URLs to backend:", error)
      throw error
    }
  }

  const uploadDocuments = async (urls: string[], docNames: string[]) => {
    try {
      setError(null)
      console.log("📤 Sending document URLs to backend:", { urls, docNames })

      const response = await apiClient.uploadDocuments(urls, docNames)

      if (response.success) {
        setPartnerData(response.data?.partner || {})
        setProgress(response.data?.onboardingProgress || progress)
        console.log("✅ Document URLs saved to backend successfully")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      console.error("❌ Error saving document URLs to backend:", error)
      throw error
    }
  }

  const completeOnboarding = async () => {
    try {
      setError(null)
      const response = await apiClient.completeOnboarding()

      if (response.success) {
        setOnboardingStatus("pending_verification")
        setProgress(100)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        step,
        progress,
        onboardingStatus,
        partnerData,
        loading,
        error,
        goToStep,
        updateBasicInfo,
        addService,
        updateLocations,
        uploadPortfolio,
        uploadDocuments,
        completeOnboarding,
        refreshStatus,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}
