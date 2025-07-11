"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth"
import app from "@/lib/firebase"
import Cookies from "js-cookie"

interface AdminAuthContextType {
  adminUser: User | null
  loading: boolean
  error: string | null
  setupRequired: boolean | null
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Use the same API base URL as the main API client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://pixisphere-backend-t2l9.onrender.com/api/v1"

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const auth = getAuth(app)

  // Function to check if user is admin using /users/me endpoint
  const checkAdminStatus = async (user: User): Promise<boolean> => {
    try {
      setError(null)

      const token = await user.getIdToken()
      const userMeUrl = `${API_BASE_URL}/users/me`

      console.log("🔍 Checking user type at:", userMeUrl)

      const response = await fetch(userMeUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("📥 User check response status:", response.status)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized: Admin access required")
        }
        throw new Error("Failed to verify user status")
      }

      const data = await response.json()
      console.log("📥 User data:", data)

      if (data.success && data.data.user) {
        const userData = data.data.user
        console.log("User type:", userData.userType)

        // Check if user is admin
        if (userData.userType === "admin") {
          console.log("✅ User is admin - setting cookies and state")

          // Set both admin and auth token cookies with proper options
          Cookies.set("authToken", token, {
            expires: 1,
            sameSite: "lax",
            secure: window.location.protocol === "https:",
          })
          Cookies.set("isAdmin", "true", {
            expires: 1,
            sameSite: "lax",
            secure: window.location.protocol === "https:",
          })

          setAdminUser(user)
          setError(null)
          setSetupRequired(false)

          console.log("✅ Admin cookies set successfully")
          return true
        } else {
          console.log("❌ User is not admin - userType:", userData.userType)
          throw new Error("Unauthorized: Admin access required")
        }
      } else {
        throw new Error("Invalid user data received")
      }
    } catch (error: any) {
      console.error("❌ Admin status check error:", error)

      // Remove admin cookies
      Cookies.remove("isAdmin")
      Cookies.remove("authToken")

      // Sign out the user if they're not authorized
      try {
        await auth.signOut()
      } catch (signOutError) {
        console.error("Error signing out:", signOutError)
      }

      setAdminUser(null)
      setError(error.message || "Failed to verify admin status. Please try again.")
      return false
    }
  }

  // Function to check admin setup status (for initial setup)
  const checkAdminSetup = async () => {
    try {
      const checkSetupUrl = `${API_BASE_URL}/admin-setup/check-setup`

      console.log("🔍 Checking admin setup at:", checkSetupUrl)

      const response = await fetch(checkSetupUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📥 Admin setup check response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("📥 Admin setup check data:", data)

        if (data.success) {
          setSetupRequired(data.data.setupRequired)
          return data.data.setupRequired
        }
      }

      // If check fails, assume setup is not required
      setSetupRequired(false)
      return false
    } catch (error) {
      console.error("Admin setup check error:", error)
      setSetupRequired(false)
      return false
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔍 Auth state changed:", user?.email || "No user")

      if (user) {
        console.log("🔍 User authenticated, checking admin status for:", user.email)
        const isAdmin = await checkAdminStatus(user)

        if (!isAdmin) {
          setAdminUser(null)
        }
      } else {
        console.log("❌ No user authenticated")
        // Remove admin cookies when logged out
        Cookies.remove("isAdmin")
        Cookies.remove("authToken")
        setAdminUser(null)
        setError(null)
        setSetupRequired(null)
      }

      setLoading(false)
      setAuthChecked(true)
    })

    return () => unsubscribe()
  }, [])

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)

      console.log("🔐 Attempting admin login for:", email)

      // First check if admin setup is required
      const setupRequired = await checkAdminSetup()

      if (setupRequired) {
        console.log("⚠️ Admin setup required - no super admin exists")
        setSetupRequired(true)
        setLoading(false)
        return false
      }

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("✅ Firebase login successful for", email)

      // Check admin status immediately
      const isAdmin = await checkAdminStatus(userCredential.user)

      setLoading(false)
      return isAdmin
    } catch (error: any) {
      console.error("❌ Admin login failed:", error)
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address")
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else {
        setError(error.message || "Login failed")
      }
      setLoading(false)
      return false
    }
  }

  const adminLogout = async () => {
    try {
      setError(null)
      // Remove both cookies
      Cookies.remove("authToken")
      Cookies.remove("isAdmin")
      await signOut(auth)
      setAdminUser(null)
      setSetupRequired(null)
      console.log("✅ Admin logout successful")
    } catch (error: any) {
      console.error("❌ Admin logout failed:", error)
      setError(error.message)
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{ adminUser, loading: loading || !authChecked, error, setupRequired, adminLogin, adminLogout }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
