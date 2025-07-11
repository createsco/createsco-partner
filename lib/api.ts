import { getCurrentToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  token?: string
}

class ApiClient {
  private async getAuthHeaders(forceRefresh = false): Promise<HeadersInit> {
    try {
      const token = await getCurrentToken(forceRefresh)
      console.log("Retrieved token:", token ? "Token exists" : "No token")

      const headers: HeadersInit = {
        Accept: "*/*",
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("Authorization header set")
      }

      return headers
    } catch (error) {
      console.error("Error getting auth headers:", error)
      return {
        Accept: "*/*",
        "Content-Type": "application/json",
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryWithRefresh = true,
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${API_BASE_URL}${endpoint}`
    console.log(`🚀 Making request to FULL URL: ${fullUrl}`)
    console.log(`🌐 Frontend domain: ${window.location.origin}`)
    console.log(`🔧 API_BASE_URL: ${API_BASE_URL}`)
    console.log(`🔧 Endpoint: ${endpoint}`)

    try {
      const headers = await this.getAuthHeaders()

      console.log("📤 Request headers:", headers)
      console.log("📤 Request method:", options.method || "GET")
      console.log("📤 Request body:", options.body)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(fullUrl, {
        method: "GET",
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
        mode: "cors",
        credentials: "omit",
      })

      clearTimeout(timeoutId)

      console.log(`📥 Response status: ${response.status}`)
      console.log(`📥 Response ok: ${response.ok}`)
      console.log(`📥 Response URL: ${response.url}`)

      // Handle 401 Unauthorized - token might be stale
      if (response.status === 401 && retryWithRefresh) {
        console.log("🔄 API: Got 401, retrying with refreshed token...")

        // Get fresh headers with force refresh
        const freshHeaders = await this.getAuthHeaders(true)

        // Retry the request with fresh token
        const retryResponse = await fetch(fullUrl, {
          method: "GET",
          ...options,
          headers: {
            ...freshHeaders,
            ...options.headers,
          },
          signal: controller.signal,
          mode: "cors",
          credentials: "omit",
        })

        console.log(`📥 Retry response status: ${retryResponse.status}`)

        if (retryResponse.ok) {
          const data = await retryResponse.json()
          console.log("✅ Request successful after token refresh")
          return data
        } else {
          // Gracefully handle non-JSON error bodies
          let errorData: { message?: string } = {}
          const retryContentType = retryResponse.headers.get("content-type")

          try {
            if (retryContentType && retryContentType.includes("application/json")) {
              errorData = await retryResponse.json()
            } else {
              const text = await retryResponse.text()
              errorData = { message: text }
            }
          } catch (parseErr) {
            // Fallback when response body is empty or cannot be parsed
            console.warn("⚠️ Could not parse retry error response:", parseErr)
          }

          console.error("❌ Request failed even after token refresh:", errorData)
          throw new Error(errorData.message || `HTTP error! status: ${retryResponse.status}`)
        }
      }

      const contentType = response.headers.get("content-type")
      console.log(`📥 Content-Type: ${contentType}`)

      let data: any

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
        console.log("📥 Response data:", data)
      } else {
        const text = await response.text()
        console.log("📥 Non-JSON response:", text)
        data = { success: false, message: text || "Invalid response format" }
      }

      if (!response.ok) {
        console.error("❌ Request failed:", data)
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log("✅ Request successful")
      return data
    } catch (error: any) {
      console.error("❌ API Error:", error)

      if (error.name === "AbortError") {
        throw new Error("Request timeout. The backend server may be slow or unavailable.")
      }

      if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
        console.error("Network Error - Frontend domain:", window.location.origin)
        throw new Error(
          `Network Error: Unable to connect to backend server. Please check your internet connection or try again later.`,
        )
      }

      if (error.message.includes("CORS")) {
        throw new Error(`CORS Error: Please add "${window.location.origin}" to your backend CORS configuration.`)
      }

      throw new Error(error.message || "An unexpected error occurred")
    }
  }

  // Health check endpoint - direct call without API prefix
  async healthCheck(): Promise<any> {
    try {
      console.log("🏥 Testing health check...")
      console.log("🌐 Current domain:", window.location.origin)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const baseDomain = API_BASE_URL.replace(/\/api\/v[0-9]+.*/, "")
      const response = await fetch(`${baseDomain}/health`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("🏥 Health check response status:", response.status)
      const data = await response.json()
      console.log("🏥 Health check data:", data)
      return data
    } catch (error) {
      console.error("🏥 Health check failed:", error)
      throw error
    }
  }

  // Get current frontend domain for CORS configuration
  getCurrentDomain(): string {
    return window.location.origin
  }

  // Authentication endpoints
  async register(userData: any): Promise<ApiResponse> {
    console.log("🚀 Registering user with data:", userData)
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(): Promise<ApiResponse> {
    return this.request("/auth/login", {
      method: "POST",
    })
  }

  async getMe(): Promise<
    ApiResponse<{
      user: {
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
      }
    }>
  > {
    return this.request("/users/me")
  }

  // Check if backend is available
  async isBackendAvailable(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch (error) {
      console.warn("Backend health check failed:", error)
      return false
    }
  }

  // Partner Onboarding endpoints
  async getOnboardingStatus(): Promise<ApiResponse> {
    return this.request("/partner-onboarding/status")
  }

  async updateBasicInfo(data: {
    companyName: string
    partnerType: string
    experienceYears: number
    specializations: string[]
    socialLinks: {
      website?: string
      instagram?: string
      facebook?: string
    }
  }): Promise<ApiResponse> {
    return this.request("/partner-onboarding/basic-info", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async addService(data: {
    name: string
    description: string
    basePrice: number
    priceUnit: string
  }): Promise<ApiResponse> {
    return this.request("/partner-onboarding/services", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateLocations(data: {
    partnerLocations: Array<{
      city: string
      state: string
      coordinates: { lat: number; lng: number }
      pinCodesServed: string[]
    }>
    servingLocations: string[]
    locationPricing: Record<string, number>
  }): Promise<ApiResponse> {
    return this.request("/partner-onboarding/locations", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async uploadPortfolio(urls: string[]): Promise<ApiResponse> {
    console.log("📤 API: Sending portfolio URLs to backend:", urls)
    // Ensure urls is a flat array of strings
    const portfolioUrls = Array.isArray(urls) ? urls : []
    console.log("📤 API: Formatted portfolioUrls:", portfolioUrls)

    return this.request("/partner-onboarding/portfolio", {
      method: "POST",
      body: JSON.stringify({ portfolioUrls }),
    })
  }

  async uploadDocuments(urls: string[], docNames: string[]): Promise<ApiResponse> {
    console.log("📤 API: Sending document data to backend:", { urls, docNames })

    // Format documents according to backend API expectation
    const documents = urls.map((url, index) => ({
      docName: docNames[index],
      fileUrl: url,
    }))

    console.log("📤 API: Formatted documents for backend:", documents)

    return this.request("/partner-onboarding/documents", {
      method: "POST",
      body: JSON.stringify({ documents }),
    })
  }

  async completeOnboarding(): Promise<ApiResponse> {
    return this.request("/partner-onboarding/complete", {
      method: "POST",
    })
  }

  async removePortfolioImage(imageUrl: string): Promise<ApiResponse> {
    console.log("🗑️ API: Removing portfolio image:", imageUrl)
    return this.request("/partner-onboarding/portfolio", {
      method: "DELETE",
      body: JSON.stringify({ imageUrl }),
    })
  }

  // Partner profile management (for partners themselves) - Updated to match backend routes
  async getPartnerProfile(): Promise<ApiResponse<{ partner: any }>> {
    return this.request("/partners/me")
  }

  async updatePartnerProfile(data: any): Promise<ApiResponse<{ partner: any }>> {
    return this.request("/partners/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  // Service management (for partners themselves) - Updated to match backend routes
  async addPartnerService(data: any): Promise<ApiResponse<{ partner: any }>> {
    return this.request("/partners/services", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePartnerService(serviceId: string, data: any): Promise<ApiResponse<{ partner: any }>> {
    return this.request(`/partners/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deletePartnerService(serviceId: string): Promise<ApiResponse<{ partner: any }>> {
    return this.request(`/partners/services/${serviceId}`, {
      method: "DELETE",
    })
  }

  // Portfolio management endpoints - NEW
  async addPortfolioItem(data: {
    imageUrl: string
    title: string
    description?: string
    category: string
    tags?: string[]
  }): Promise<ApiResponse<{ portfolioItem: any }>> {
    console.log("📤 API: Adding portfolio item:", data)
    return this.request("/partners/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePortfolioItem(
    portfolioId: string,
    data: {
      title?: string
      description?: string
      category?: string
      tags?: string[]
    },
  ): Promise<ApiResponse<{ portfolioItem: any }>> {
    console.log("📤 API: Updating portfolio item:", portfolioId, data)
    return this.request(`/partners/portfolio/${portfolioId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deletePortfolioItem(portfolioId: string): Promise<ApiResponse> {
    console.log("🗑️ API: Deleting portfolio item:", portfolioId)
    return this.request(`/partners/portfolio/${portfolioId}`, {
      method: "DELETE",
    })
  }

  // Document management (for partners themselves) - Updated to match backend routes
  async uploadPartnerDocuments(formData: FormData): Promise<ApiResponse<{ documents: any[] }>> {
    const headers = await this.getAuthHeaders()
    delete (headers as any)["Content-Type"] // Let browser set content type for FormData

    return this.request("/partners/documents", {
      method: "POST",
      body: formData,
      headers,
    })
  }

  // Portfolio management (for partners themselves) - New endpoint
  async uploadPartnerPortfolio(formData: FormData): Promise<ApiResponse<{ portfolio: any[] }>> {
    const headers = await this.getAuthHeaders()
    delete (headers as any)["Content-Type"] // Let browser set content type for FormData

    return this.request("/partners/portfolio", {
      method: "POST",
      body: formData,
      headers,
    })
  }

  async deletePartnerPortfolioItem(portfolioId: string): Promise<ApiResponse<{ partner: any }>> {
    return this.request(`/partners/portfolio/${portfolioId}`, {
      method: "DELETE",
    })
  }

  // Public partner endpoints (no auth required)
  async getPublicPartners(params?: {
    page?: number
    limit?: number
    location?: string
    specialization?: string
    minRating?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/partners${queryString}`)
  }

  async getPublicPartnerProfile(partnerId: string): Promise<ApiResponse> {
    console.log(`🔍 Fetching public partner profile for ID: ${partnerId}`)
    return this.request(`/partners/${partnerId}`)
  }

  // Admin endpoints - these use the admin routes with full access
  async getAdminStats(): Promise<ApiResponse> {
    return this.request("/admin/dashboard/stats")
  }

  async getPendingPartners(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/admin/partners/pending${queryString}`)
  }

  async getPartners(params?: {
    page?: number
    limit?: number
    status?: string
    verified?: string
    sortBy?: string
    sortOrder?: string
    search?: string
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/admin/partners${queryString}`)
  }

  // Admin partner details - this should use the admin endpoint for full access
  async getPartnerDetails(partnerId: string): Promise<ApiResponse> {
    console.log(`🔍 Admin fetching partner details for ID: ${partnerId}`)
    return this.request(`/admin/partners/${partnerId}`)
  }

  async approveDocument(partnerId: string, documentId: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/admin/partners/${partnerId}/documents/${documentId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    })
  }

  async rejectDocument(partnerId: string, documentId: string, reason: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/admin/partners/${partnerId}/documents/${documentId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason, notes }),
    })
  }

  async verifyPartner(partnerId: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/admin/partners/${partnerId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    })
  }

  async rejectPartner(partnerId: string, reason: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/admin/partners/${partnerId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason, notes }),
    })
  }

  async getVerificationHistory(partnerId: string): Promise<ApiResponse> {
    return this.request(`/admin/partners/${partnerId}/history`)
  }

  async bulkAction(action: string, partnerIds: string[], reason?: string, notes?: string): Promise<ApiResponse> {
    return this.request("/admin/partners/bulk-action", {
      method: "PATCH",
      body: JSON.stringify({ action, partnerIds, reason, notes }),
    })
  }

  // Lead management endpoints
  async getLeads(params?: {
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/leads${queryString}`)
  }

  async getLeadStats(params?: {
    period?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : ""
    return this.request(`/leads/stats/partner${queryString}`)
  }

  async getLeadDetails(leadId: string): Promise<ApiResponse> {
    return this.request(`/leads/${leadId}`)
  }

  async updateLead(
    leadId: string,
    data: {
      status?: string
      priority?: string
    },
  ): Promise<ApiResponse> {
    return this.request(`/leads/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async addLeadNote(leadId: string, note: string): Promise<ApiResponse> {
    console.log("📤 API: Adding lead note:", { leadId, note })
    return this.request(`/leads/${leadId}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    })
  }

  // Real-time notifications
  createNotificationStream(): EventSource | null {
    try {
      const token = localStorage.getItem("firebaseToken")
      if (!token) return null

      const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return eventSource
    } catch (error) {
      console.error("Error creating notification stream:", error)
      return null
    }
  }
}

export const apiClient = new ApiClient()
