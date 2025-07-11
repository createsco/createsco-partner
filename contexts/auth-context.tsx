"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { refreshTokenAndCookies } from "@/lib/auth"
import Cookies from "js-cookie"

interface AuthContextType {
  user: User | null
  loading: boolean
  emailVerified: boolean
  signOut: () => Promise<void>
  refreshToken: () => Promise<void>
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)

  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        console.log("🔄 Auth Context: Refreshing token and cookies...")
        await refreshTokenAndCookies()
        console.log("✅ Auth Context: Token and cookies refreshed")
      }
    } catch (error) {
      console.error("❌ Auth Context: Error refreshing token:", error)
    }
  }

  const reloadUser = async () => {
    try {
      if (auth.currentUser) {
        console.log("🔄 Auth Context: Reloading user...")
        await auth.currentUser.reload()

        // Update local state with fresh user data
        const updatedUser = auth.currentUser
        setUser(updatedUser)
        setEmailVerified(updatedUser?.emailVerified || false)

        // If email verification status changed, refresh token
        if (updatedUser?.emailVerified && !emailVerified) {
          console.log("🔄 Auth Context: Email verified! Refreshing token...")
          await refreshTokenAndCookies()
        }

        console.log("✅ Auth Context: User reloaded", {
          email: updatedUser?.email,
          emailVerified: updatedUser?.emailVerified,
        })
      }
    } catch (error) {
      console.error("❌ Auth Context: Error reloading user:", error)
    }
  }

  const signOut = async () => {
    try {
      console.log("🚪 Auth Context: Signing out...")
      await firebaseSignOut(auth)
      Cookies.remove("authToken")
      setUser(null)
      setEmailVerified(false)
      console.log("✅ Auth Context: Signed out successfully")
    } catch (error) {
      console.error("❌ Auth Context: Error signing out:", error)
      throw error
    }
  }

  useEffect(() => {
    console.log("🔄 Auth Context: Setting up auth state listener...")

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Auth Context: Auth state changed", {
        user: user?.email,
        emailVerified: user?.emailVerified,
        uid: user?.uid,
      })

      if (user) {
        // Always get a fresh token when auth state changes
        try {
          console.log("🔄 Auth Context: Getting fresh token...")
          const token = await user.getIdToken(true) // Force refresh
          Cookies.set("authToken", token, { expires: 1 })
          console.log("✅ Auth token cookie set with fresh token")
        } catch (error) {
          console.error("❌ Failed to set auth token cookie:", error)
        }
      } else {
        // Remove auth token cookie when user is not authenticated
        Cookies.remove("authToken")
        console.log("🗑️ Auth token cookie removed")
      }

      setUser(user)
      setEmailVerified(user?.emailVerified || false)
      setLoading(false)
    })

    return () => {
      console.log("🔄 Auth Context: Cleaning up auth state listener")
      unsubscribe()
    }
  }, [])

  // Auto-refresh user data periodically to catch verification changes
  useEffect(() => {
    if (user && !emailVerified) {
      console.log("⏰ Auth Context: Setting up verification check interval...")

      const interval = setInterval(async () => {
        console.log("🔍 Auth Context: Checking verification status...")
        await reloadUser()
      }, 3000) // Check every 3 seconds

      return () => {
        console.log("⏰ Auth Context: Clearing verification check interval")
        clearInterval(interval)
      }
    }
  }, [user, emailVerified])

  const value = {
    user,
    loading,
    emailVerified,
    signOut,
    refreshToken,
    reloadUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
