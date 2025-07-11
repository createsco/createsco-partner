"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2 } from "lucide-react"
import { resendEmailVerification, reloadUser, isEmailVerified } from "@/lib/auth"

interface EmailVerificationPromptProps {
  email: string
  onVerified: () => void
  onBack: () => void
}

export function EmailVerificationPrompt({ email, onVerified, onBack }: EmailVerificationPromptProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleCheckVerification = async () => {
    setLoading(true)
    setError("")

    try {
      await reloadUser()

      if (isEmailVerified()) {
        onVerified()
      } else {
        setError("Email not yet verified. Please check your inbox.")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification()
      setResendSuccess(true)
      setError("")
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Mail className="h-6 w-6 mr-2 text-blue-600" />
          Verify Your Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-gray-600">
          Please verify your email address <strong>{email}</strong> to continue.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendSuccess && (
          <Alert>
            <AlertDescription>Verification email sent successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button onClick={handleCheckVerification} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "I've Verified My Email"
            )}
          </Button>

          <Button variant="outline" onClick={handleResendVerification} className="w-full">
            Resend Verification Email
          </Button>

          <Button variant="ghost" onClick={onBack} className="w-full">
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
