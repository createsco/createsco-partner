import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"
import Cookies from "js-cookie"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
}

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthUser & { emailVerified: boolean }> => {
  try {
    console.log("🔐 Auth: Signing in user...")
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Reload user to get latest verification status
    await reload(user)

    // Force token refresh to get updated claims
    console.log("🔄 Auth: Refreshing token to get latest claims...")
    const token = await user.getIdToken(true) // true forces refresh

    // Set the refreshed token as a cookie
    Cookies.set("authToken", token, { expires: 1 }) // 1 day expiry
    console.log("✅ Auth token cookie set with refreshed token")

    // Store token only if email is verified
    if (user.emailVerified) {
      localStorage.setItem("firebaseToken", token)
      console.log("✅ Auth: User signed in successfully (verified)")
    } else {
      console.log("⚠️ Auth: User signed in but email not verified")
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    }
  } catch (error: any) {
    console.error("❌ Auth: Sign in failed:", error)
    throw new Error(error.message || "Login failed")
  }
}

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<AuthUser> => {
  try {
    console.log("📝 Auth: Creating new user account...")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send email verification
    console.log("📧 Auth: Sending email verification...")
    await sendEmailVerification(user)
    console.log("✅ Auth: User account created and verification email sent")

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    }
  } catch (error: any) {
    console.error("❌ Auth: Sign up failed:", error)
    throw new Error(error.message || "Registration failed")
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    console.log("🚪 Auth: Signing out user...")
    await firebaseSignOut(auth)
    Cookies.remove("authToken")
    localStorage.removeItem("firebaseToken")
    console.log("✅ Auth: User signed out successfully")
  } catch (error: any) {
    console.error("❌ Auth: Sign out failed:", error)
    throw new Error(error.message || "Logout failed")
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Get current Firebase ID token with force refresh option
export const getCurrentToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken(forceRefresh)
      console.log(`✅ Auth: Token retrieved successfully ${forceRefresh ? "(refreshed)" : "(cached)"}`)
      return token
    }
    console.log("⚠️ Auth: No current user found")
    return null
  } catch (error: any) {
    console.error("❌ Auth: Error getting token:", error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser
}

// Get current Firebase user
export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser
}

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Check if email is verified
export const isEmailVerified = (): boolean => {
  const user = auth.currentUser
  return user ? user.emailVerified : false
}

// Resend email verification
export const resendEmailVerification = async (): Promise<void> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("No user is currently signed in")
  }

  if (user.emailVerified) {
    throw new Error("Email is already verified")
  }

  try {
    console.log("📧 Auth: Resending email verification...")
    await sendEmailVerification(user)
    console.log("✅ Auth: Email verification sent successfully")
  } catch (error: any) {
    console.error("❌ Auth: Failed to resend email verification:", error)
    throw new Error(error.message || "Failed to send verification email")
  }
}

// Reload user to check verification status
export const reloadUser = async (): Promise<void> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("No user is currently signed in")
  }

  try {
    console.log("🔄 Auth: Reloading user data...")
    await reload(user)

    // Get fresh user data
    const freshUser = auth.currentUser
    console.log("✅ Auth: User data reloaded", {
      email: freshUser?.email,
      emailVerified: freshUser?.emailVerified,
      uid: freshUser?.uid,
    })
  } catch (error: any) {
    console.error("❌ Auth: Failed to reload user:", error)
    throw new Error(error.message || "Failed to reload user data")
  }
}

// Force refresh token and update cookies - NEW FUNCTION
export const refreshTokenAndCookies = async (): Promise<void> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error("No user is currently signed in")
  }

  try {
    console.log("🔄 Auth: Force refreshing token and updating cookies...")

    // Force token refresh to get updated claims
    const token = await user.getIdToken(true)

    // Update auth token cookie
    Cookies.set("authToken", token, { expires: 1 })

    // Update localStorage if email is verified
    if (user.emailVerified) {
      localStorage.setItem("firebaseToken", token)
    }

    console.log("✅ Auth: Token refreshed and cookies updated", {
      emailVerified: user.emailVerified,
    })
  } catch (error: any) {
    console.error("❌ Auth: Failed to refresh token:", error)
    throw new Error(error.message || "Failed to refresh token")
  }
}

// Wait for email verification with polling and token refresh
export const waitForEmailVerification = async (maxAttempts = 30): Promise<boolean> => {
  console.log("⏳ Auth: Waiting for email verification...")

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Reload user data from Firebase
      await reloadUser()
      const user = auth.currentUser

      if (user?.emailVerified) {
        console.log("✅ Auth: Email verification detected!")

        // IMPORTANT: Refresh token to get updated claims
        console.log("🔄 Auth: Refreshing token to get updated email_verified claim...")
        await refreshTokenAndCookies()

        return true
      }

      console.log(`🔍 Auth: Verification check ${attempt}/${maxAttempts} - not verified yet`)

      // Wait 2 seconds before next check
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`❌ Auth: Error checking verification (attempt ${attempt}):`, error)
    }
  }

  console.log("⏰ Auth: Timeout waiting for email verification")
  return false
}

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    console.log("🔑 Auth: Sending password reset email...")
    await sendPasswordResetEmail(auth, email)
    console.log("✅ Auth: Password reset email sent successfully")
  } catch (error: any) {
    console.error("❌ Auth: Failed to send password reset email:", error)

    // Handle specific Firebase error codes
    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email address")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address")
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many attempts. Please try again later")
    } else {
      throw new Error(error.message || "Failed to send password reset email")
    }
  }
}
