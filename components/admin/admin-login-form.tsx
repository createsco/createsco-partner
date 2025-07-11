"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { adminLogin, error, setupRequired } = useAdminAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const success = await adminLogin(email, password)

      if (success) {
        console.log("✅ Admin login successful, redirecting to dashboard")
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (setupRequired) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Admin setup is required. Please contact your system administrator to set up the first admin account.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/admin/setup")} className="w-full">
          Go to Admin Setup
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="admin@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Enter your password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !email || !password}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}
