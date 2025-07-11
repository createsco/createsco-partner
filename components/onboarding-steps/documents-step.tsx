"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, X, FileText, CheckCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/onboarding-context"
import { FirebaseStorageService } from "@/lib/firebase-storage"

interface DocumentFile {
  file: File
  name: string
}

export function DocumentsStep() {
  const { partnerData, uploadDocuments, goToStep } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<DocumentFile[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ url: string; name: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingDocuments = partnerData.documents || []

  const requiredDocuments = [
    "Business Registration Certificate",
    "Tax Registration (GST/PAN)",
    "Identity Proof (Aadhar/Passport)",
    "Address Proof",
    "Bank Account Details",
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      const validation = FirebaseStorageService.validateDocument(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      alert(`Some files were skipped:\n${errors.join("\n")}`)
    }

    // Add files with default names
    const newDocuments = validFiles.map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
    }))

    setSelectedFiles((prev) => [...prev, ...newDocuments])
  }

  const handleDocumentNameChange = (index: number, name: string) => {
    setSelectedFiles((prev) => prev.map((doc, i) => (i === index ? { ...doc, name } : doc)))
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setLoading(true)
    setUploadProgress(0)

    try {
      console.log(`🚀 Starting upload of ${selectedFiles.length} documents`)

      // Upload files to Firebase Storage
      const uploadResults = []
      const documentData = []
      const totalFiles = selectedFiles.length

      for (let i = 0; i < selectedFiles.length; i++) {
        const doc = selectedFiles[i]
        console.log(`📤 Uploading document ${i + 1}/${totalFiles}: ${doc.name}`)

        const result = await FirebaseStorageService.uploadDocument(doc.file, doc.name)
        uploadResults.push(result.url)
        documentData.push({
          url: result.url,
          name: doc.name,
        })

        // Update progress
        const progress = ((i + 1) / totalFiles) * 90 // 90% for upload, 10% for API call
        setUploadProgress(progress)
      }

      console.log(`✅ All documents uploaded to Firebase. URLs:`, uploadResults)

      // Send URLs and names to backend
      setUploadProgress(95)
      const docNames = selectedFiles.map((doc) => doc.name)
      await uploadDocuments(uploadResults, docNames)

      setUploadProgress(100)
      setUploadedDocuments(documentData)
      setSelectedFiles([])

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      console.log(`🎉 Document upload completed successfully`)
    } catch (error) {
      console.error("❌ Error uploading documents:", error)
      alert(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const handleContinue = () => {
    goToStep(6)
  }

  const getDocumentStatus = (docName: string) => {
    const doc = existingDocuments.find((d: any) => d.docName === docName)
    return doc?.status || "missing"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
        <p className="text-gray-600">Upload required documents for verification</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Required Documents Checklist */}
        <div className="space-y-4">
          <h3 className="font-semibold">Required Documents</h3>
          <div className="space-y-2">
            {requiredDocuments.map((docName, index) => {
              const status = getDocumentStatus(docName)
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{docName}</span>
                  </div>
                  <Badge className={getStatusColor(status)}>{status === "missing" ? "Required" : status}</Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              Uploaded Documents
              <CheckCircle className="h-5 w-5 text-green-600" />
            </h3>
            <div className="space-y-2">
              {existingDocuments.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <span className="font-medium">{doc.docName}</span>
                      {doc.reviewNotes && <p className="text-sm text-gray-600">{doc.reviewNotes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Uploaded (this session) */}
        {uploadedDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-green-600">
              Recently Uploaded
              <CheckCircle className="h-5 w-5" />
            </h3>
            <div className="space-y-2">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-green-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">{doc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
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
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
              <p className="text-gray-600 mb-4">Drag and drop your documents here, or click to browse</p>
              <p className="text-sm text-gray-500">Supports: PDF, JPG, JPEG, PNG, WebP • Max size: 10MB per file</p>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Selected Documents ({selectedFiles.length})</h4>
              <div className="space-y-3">
                {selectedFiles.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{doc.file.name}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor={`doc-name-${index}`} className="text-xs">
                          Document Name
                        </Label>
                        <Input
                          id={`doc-name-${index}`}
                          placeholder="Enter document name"
                          value={doc.name}
                          onChange={(e) => handleDocumentNameChange(index, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
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
              <Button
                onClick={handleUpload}
                disabled={loading || selectedFiles.length === 0 || selectedFiles.some((doc) => !doc.name.trim())}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading {selectedFiles.length} documents to Firebase...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {selectedFiles.length} documents to Firebase
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Document Guidelines */}
        <div className="bg-amber-50 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-900 mb-2">Document Guidelines</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Ensure all documents are clear and readable</li>
            <li>• Upload original or certified copies</li>
            <li>• Documents should be current and not expired</li>
            <li>• File names should clearly indicate the document type</li>
            <li>• All text in documents should be clearly visible</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => goToStep(4)}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={existingDocuments.length === 0 && uploadedDocuments.length === 0}>
            Continue to Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
