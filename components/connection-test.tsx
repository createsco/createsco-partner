"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle, Globe } from "lucide-react"
import { apiClient } from "@/lib/api"
import { CorsConfigHelper } from "./cors-config-helper"

export function ConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [showCorsConfig, setShowCorsConfig] = useState(false)

  const runTests = async () => {
    setTesting(true)
    setResults(null)

    const testResults = {
      healthCheck: null as any,
      loginTest: null as any,
      tokenTest: null as any,
      domainInfo: null as any,
    }

    try {
      // Test 1: Health Check
      console.log("🏥 Running health check...")
      try {
        const healthResult = await apiClient.healthCheck()
        testResults.healthCheck = { success: true, data: healthResult }
        console.log("✅ Health check passed")
      } catch (error: any) {
        testResults.healthCheck = { success: false, error: error.message }
        console.log("❌ Health check failed:", error.message)
      }

      // Test 2: Login API Test
      console.log("🔐 Testing login endpoint...")
      try {
        const loginResult = await apiClient.login()
        testResults.loginTest = { success: true, data: loginResult }
        console.log("✅ Login test passed")
      } catch (error: any) {
        testResults.loginTest = { success: false, error: error.message }
        console.log("❌ Login test failed:", error.message)
      }

      // Test 3: Token Test
      console.log("🔑 Testing token retrieval...")
      try {
        const token = localStorage.getItem("firebaseToken")
        if (token) {
          testResults.tokenTest = {
            success: true,
            data: {
              hasToken: true,
              tokenLength: token.length,
              tokenPreview: token.substring(0, 20) + "...",
            },
          }
        } else {
          testResults.tokenTest = {
            success: false,
            error: "No token found in localStorage",
          }
        }
        console.log("✅ Token test completed")
      } catch (error: any) {
        testResults.tokenTest = { success: false, error: error.message }
        console.log("❌ Token test failed:", error.message)
      }

      // Test 4: Domain Info
      testResults.domainInfo = {
        success: true,
        data: {
          currentDomain: apiClient.getCurrentDomain(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      console.error("Test suite failed:", error)
    }

    setResults(testResults)
    setTesting(false)
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean) => {
    return <Badge variant={success ? "default" : "destructive"}>{success ? "PASS" : "FAIL"}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connection & CORS Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CORS Issue:</strong> Your backend needs to allow requests from this domain. Backend logs show
              requests are reaching the server but being blocked by CORS policy.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={runTests} disabled={testing} className="flex-1">
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowCorsConfig(!showCorsConfig)}>
              {showCorsConfig ? "Hide" : "Show"} CORS Config
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              {/* Health Check Result */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.healthCheck?.success)}
                    <span className="font-medium">Health Check</span>
                  </div>
                  {getStatusBadge(results.healthCheck?.success)}
                </div>
                {results.healthCheck?.success ? (
                  <div className="text-sm text-green-600">
                    Status: {results.healthCheck.data?.status} | Firebase: {results.healthCheck.data?.firebase}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>{results.healthCheck?.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Login Test Result */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.loginTest?.success)}
                    <span className="font-medium">Login API Test</span>
                  </div>
                  {getStatusBadge(results.loginTest?.success)}
                </div>
                {results.loginTest?.success ? (
                  <div className="text-sm text-green-600">Login endpoint is working!</div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>{results.loginTest?.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Token Test Result */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.tokenTest?.success)}
                    <span className="font-medium">Token Test</span>
                  </div>
                  {getStatusBadge(results.tokenTest?.success)}
                </div>
                {results.tokenTest?.success ? (
                  <div className="text-sm text-green-600">Token Length: {results.tokenTest.data?.tokenLength}</div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>{results.tokenTest?.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Domain Info */}
              {results.domainInfo?.success && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Frontend Domain Info</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Domain:</strong> <code>{results.domainInfo.data?.currentDomain}</code>
                    </p>
                    <p>
                      <strong>Timestamp:</strong> {results.domainInfo.data?.timestamp}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showCorsConfig && <CorsConfigHelper />}
    </div>
  )
}
