"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Edit2, Trash2, Plus, ImageIcon, Loader2, CheckCircle, AlertCircle, Search } from "lucide-react"
import { uploadMultipleImages, validateImageFile } from "@/lib/firebase-storage"
import { apiClient } from "@/lib/api"

interface PortfolioItem {
  id: string
  url: string
  title: string
  description: string
  category: string
  tags: string[]
}

interface PortfolioMetadata {
  [url: string]: {
    title: string
    description: string
    category: string
    tags: string[]
  }
}

const CATEGORIES = [
  { value: "wedding", label: "Wedding" },
  { value: "portrait", label: "Portrait" },
  { value: "event", label: "Event" },
  { value: "product", label: "Product" },
  { value: "landscape", label: "Landscape" },
  { value: "fashion", label: "Fashion" },
  { value: "corporate", label: "Corporate" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
]

export function PortfolioManager() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPortfolio()
  }, [])

  useEffect(() => {
    filterItems()
  }, [portfolioItems, selectedCategory, searchQuery])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getPartnerProfile()

      if (response.success && response.data?.partner?.portfolio) {
        const portfolioUrls = response.data.partner.portfolio
        const savedMetadata = localStorage.getItem("portfolio-metadata")
        const metadata: PortfolioMetadata = savedMetadata ? JSON.parse(savedMetadata) : {}

        const items: PortfolioItem[] = portfolioUrls.map((url: string, index: number) => ({
          id: `item-${index}`,
          url,
          title: metadata[url]?.title || `Untitled ${index + 1}`,
          description: metadata[url]?.description || "",
          category: metadata[url]?.category || "other",
          tags: metadata[url]?.tags || [],
        }))

        setPortfolioItems(items)
      } else {
        setPortfolioItems([])
      }
    } catch (error: any) {
      setError(error.message || "Failed to load portfolio")
      setPortfolioItems([])
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...portfolioItems]

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredItems(filtered)
  }

  const saveMetadata = (items: PortfolioItem[]) => {
    const metadata: PortfolioMetadata = {}
    items.forEach((item) => {
      metadata[item.url] = {
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags,
      }
    })
    localStorage.setItem("portfolio-metadata", JSON.stringify(metadata))
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const validation = validateImageFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      setError(`Some files were rejected:\n${errors.join("\n")}`)
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles)
      setShowUploadDialog(true)
      setError(null)
    }
  }

  const handleUpload = async (uploadData: {
    title: string
    description: string
    category: string
    tags: string[]
  }) => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)
      setError(null)

      console.log("🚀 Starting portfolio upload from partner dashboard...")
      console.log("📤 Files to upload:", selectedFiles.length)

      // Upload images to Firebase Storage
      const uploadResult = await uploadMultipleImages(selectedFiles)

      // Extract URLs from the result - handle both array and object formats
      let imageUrls: string[]
      if (Array.isArray(uploadResult)) {
        imageUrls = uploadResult
      } else if (uploadResult && uploadResult.urls && Array.isArray(uploadResult.urls)) {
        imageUrls = uploadResult.urls
      } else {
        throw new Error("Invalid upload result format")
      }

      console.log("✅ Processed image URLs:", imageUrls)

      console.log("✅ Images uploaded to Firebase:", imageUrls)
      console.log("📤 Sending portfolioUrls to backend:", imageUrls)

      // Use the partner-onboarding portfolio endpoint which expects portfolioUrls
      const response = await apiClient.uploadPortfolio(imageUrls)

      if (response.success) {
        const newItems: PortfolioItem[] = imageUrls.map((url, index) => ({
          id: `item-${Date.now()}-${index}`,
          url,
          title: uploadData.title || `New Upload ${index + 1}`,
          description: uploadData.description,
          category: uploadData.category || "other",
          tags: uploadData.tags,
        }))

        const updatedItems = [...portfolioItems, ...newItems]
        setPortfolioItems(updatedItems)
        saveMetadata(updatedItems)

        setSelectedFiles([])
        setShowUploadDialog(false)
        setSuccess(`Successfully uploaded ${imageUrls.length} images!`)

        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error(response.error || "Failed to upload portfolio")
      }
    } catch (error: any) {
      console.error("❌ Portfolio upload error:", error)
      setError(error.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (item: PortfolioItem) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      setDeleting(item.id)
      setError(null)

      console.log("🗑️ Deleting portfolio image:", item.url)

      const response = await apiClient.removePortfolioImage(item.url)

      if (response.success) {
        //await deleteImageFromFirebase(item.url)
        const updatedItems = portfolioItems.filter((p) => p.id !== item.id)
        setPortfolioItems(updatedItems)
        saveMetadata(updatedItems)
        setSuccess("Image deleted successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error(response.error || "Failed to delete image")
      }
    } catch (error: any) {
      console.error("❌ Portfolio delete error:", error)
      setError(error.message || "Delete failed")
    } finally {
      setDeleting(null)
    }
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem({ ...item })
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const updatedItems = portfolioItems.map((item) => (item.id === editingItem.id ? editingItem : item))

    setPortfolioItems(updatedItems)
    saveMetadata(updatedItems)
    setEditingItem(null)
    setSuccess("Portfolio item updated successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const addTag = (tag: string) => {
    if (!editingItem || !tag.trim()) return
    const newTag = tag.trim()
    if (!editingItem.tags.includes(newTag)) {
      setEditingItem({
        ...editingItem,
        tags: [...editingItem.tags, newTag],
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!editingItem) return
    setEditingItem({
      ...editingItem,
      tags: editingItem.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="!bg-black-600 text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>

      {/* Pinterest-Style Gallery */}
      {filteredItems.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative break-inside-avoid mb-4 rounded-lg overflow-hidden"
              style={{ display: "inline-block", width: "100%" }}
            >
              <div className="relative">
                <img
                  src={item.url || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=300"
                  }}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-lg">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Subtle info overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                  <h3 className="text-white font-medium text-sm truncate">{item.title}</h3>
                  {item.description && <p className="text-white/80 text-xs mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                      {CATEGORIES.find((cat) => cat.value === item.category)?.label}
                    </Badge>
                    {item.tags.length > 0 && (
                      <span className="text-white/80 text-xs">
                        {item.tags.length} tag{item.tags.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "No images match your current filters."
                : "Start building your portfolio by uploading your best work."}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => fileInputRef.current?.click()} className="bg-black-600 hover:bg-black-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Images
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Dialog */}
      <UploadDialog
        open={showUploadDialog}
        onClose={() => {
          setShowUploadDialog(false)
          setSelectedFiles([])
        }}
        files={selectedFiles}
        onUpload={handleUpload}
        uploading={uploading}
      />

      {/* Edit Dialog */}
      <EditDialog
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSave={handleSaveEdit}
        onUpdate={setEditingItem}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
    </div>
  )
}

// Upload Dialog Component
function UploadDialog({
  open,
  onClose,
  files,
  onUpload,
  uploading,
}: {
  open: boolean
  onClose: () => void
  files: File[]
  onUpload: (data: any) => void
  uploading: boolean
}) {
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    category: "other",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !uploadData.tags.includes(tagInput.trim())) {
      setUploadData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setUploadData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Images ({files.length} selected)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Preview */}
          <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={file.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* Upload Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="upload-title">Title</Label>
                <Input
                  id="upload-title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title"
                />
              </div>
              <div>
                <Label htmlFor="upload-category">Category</Label>
                <Select
                  value={uploadData.category}
                  onValueChange={(value) => setUploadData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="upload-description">Description</Label>
              <Textarea
                id="upload-description"
                value={uploadData.description}
                onChange={(e) => setUploadData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe these images..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={() => onUpload(uploadData)} disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} Image{files.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Edit Dialog Component
function EditDialog({
  open,
  onClose,
  item,
  onSave,
  onUpdate,
  onAddTag,
  onRemoveTag,
}: {
  open: boolean
  onClose: () => void
  item: PortfolioItem | null
  onSave: () => void
  onUpdate: (item: PortfolioItem) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}) {
  const [tagInput, setTagInput] = useState("")

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img src={item.url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={item.title}
                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
                placeholder="Enter image title"
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={item.category} onValueChange={(value) => onUpdate({ ...item, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={item.description}
                onChange={(e) => onUpdate({ ...item, description: e.target.value })}
                placeholder="Describe this image..."
                rows={3}
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onAddTag(tagInput)
                      setTagInput("")
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onAddTag(tagInput)
                    setTagInput("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => onRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
