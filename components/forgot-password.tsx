"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { sendPasswordReset } from "@/lib/auth"
import { PartnerHeader } from "@/components/partner-header"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await sendPasswordReset(email)
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PartnerHeader />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600 text-sm">
                  We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push("/partner/login")}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                >
                  Back to sign in
                </button>

                <button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                >
                  Try different email
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 mt-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <Link
                href="/partner/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>

              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
                <p className="text-gray-600 text-sm">No worries! Enter your email and we'll send you a reset link.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending reset link...
                  </div>
                ) : (
                  "Send reset link"
                )}
              </button>

              <div className="text-center pt-4">
                <span className="text-gray-600 text-sm">Remember your password? </span>
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
