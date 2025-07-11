"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, X, CheckCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { FirebaseStorageService } from "@/lib/firebase-storage"

export function PortfolioStep() {
  const { partnerData, uploadPortfolio, goToStep } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingPortfolio = partnerData.portfolio || []

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      const validation = FirebaseStorageService.validatePortfolioImage(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      alert(`Some files were skipped:\n${errors.join("\n")}`)
    }

    // Limit to 10 files total
    const totalFiles = selectedFiles.length + validFiles.length
    if (totalFiles > 10) {
      const allowedCount = 10 - selectedFiles.length
      validFiles.splice(allowedCount)
      alert(`Only ${allowedCount} more files can be added. Maximum 10 files allowed.`)
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setLoading(true)
    setUploadProgress(0)

    try {
      console.log(`🚀 Starting upload of ${selectedFiles.length} portfolio images`)

      // Upload files to Firebase Storage
      const uploadResults = []
      const totalFiles = selectedFiles.length

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        console.log(`📤 Uploading file ${i + 1}/${totalFiles}: ${file.name}`)

        const result = await FirebaseStorageService.uploadPortfolioImage(file)
        uploadResults.push(result.url)

        // Update progress
        const progress = ((i + 1) / totalFiles) * 90 // 90% for upload, 10% for API call
        setUploadProgress(progress)
      }

      console.log(`✅ All files uploaded to Firebase. URLs:`, uploadResults)

      // Send URLs to backend
      setUploadProgress(95)
      await uploadPortfolio(uploadResults)

      setUploadProgress(100)
      setUploadedUrls(uploadResults)
      setSelectedFiles([])

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      console.log(`🎉 Portfolio upload completed successfully`)
    } catch (error) {
      console.error("❌ Error uploading portfolio:", error)
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleContinue = () => {
    goToStep(5)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
        <p className="text-gray-600">Upload your best photography work (5-10 images recommended)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Portfolio */}
        {existingPortfolio.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              Your Current Portfolio
              <CheckCircle className="h-5 w-5 text-green-600" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingPortfolio.map((imageUrl: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Uploaded (this session) */}
        {uploadedUrls.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-green-600">
              Recently Uploaded
              <CheckCircle className="h-5 w-5" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedUrls.map((imageUrl: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Recently uploaded ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                  />
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="portfolio-upload"
            />
            <label htmlFor="portfolio-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Upload Portfolio Images</h3>
              <p className="text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, WebP • Max size: 10MB per file • Max files: 10
              </p>
            </label>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>

              {/* Upload Progress */}
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading to Firebase Storage...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Upload Button */}
              <Button onClick={handleUpload} disabled={loading || selectedFiles.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading {selectedFiles.length} files to Firebase...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} files to Firebase
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Portfolio Guidelines */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Portfolio Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload your best and most recent work</li>
            <li>• Include variety in your shots (different angles, lighting, subjects)</li>
            <li>• Ensure images are high quality and well-edited</li>
            <li>• Show your unique style and specialization</li>
            <li>• Include before/after or behind-the-scenes shots if relevant</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => goToStep(3)}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={existingPortfolio.length === 0 && uploadedUrls.length === 0}>
            Continue to Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
