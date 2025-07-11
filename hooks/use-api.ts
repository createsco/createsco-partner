"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export function useApi<T>(
  apiCall: () => Promise<{ success: boolean; data?: T; error?: string }>,
  dependencies: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.error || "Failed to fetch data")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user, ...dependencies])

  return { data, loading, error, refetch: fetchData }
}

// Specific hooks for different data types
export function useLeads() {
  return useApi(() => apiClient.getLeads())
}

export function useBookings() {
  return useApi(() => apiClient.getBookings())
}

export function usePortfolio() {
  return useApi(() => apiClient.getPortfolio())
}

export function useProfile() {
  return useApi(() => apiClient.getProfile())
}

export function useReviews() {
  return useApi(() => apiClient.getReviews())
}

export function useAnalytics() {
  return useApi(() => apiClient.getAnalytics())
}

export function useBilling() {
  return useApi(() => apiClient.getBillingData())
}

export function useLeadStats(period = "30") {
  const [periodState, setPeriodState] = useState(period)

  const { data, loading, error, refetch } = useApi(() => apiClient.getLeadStats({ period: periodState }), [periodState])

  return {
    data,
    loading,
    error,
    refetch,
    period: periodState,
    setPeriod: setPeriodState,
  }
}
