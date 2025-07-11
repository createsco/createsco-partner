import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

/* -------------------------------------------------------------------------- */
/*                               Type helpers                                 */
/* -------------------------------------------------------------------------- */

export interface FileValidation {
  valid: boolean
  error?: string
}

export interface UploadResult {
  url: string
  path: string
}

/* -------------------------------------------------------------------------- */
/*                           Validation utilities                             */
/* -------------------------------------------------------------------------- */

/**
 * Generic image-file validator (JPEG, PNG, WEBP, &lt; 5 MB)
 */
export const validateImageFile = (file: File): FileValidation => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 5 * 1024 * 1024 // 5 MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP files are allowed" }
  }
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5 MB" }
  }
  return { valid: true }
}

/**
 * Document validator (PDF + the same image formats, &lt; 10 MB)
 */
export const validateDocument = (file: File): FileValidation => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10 MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only PDF, JPEG, PNG, and WebP files are allowed" }
  }
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10 MB" }
  }
  return { valid: true }
}

/* More explicit alias used in components */
export const validatePortfolioImage = validateImageFile

/* -------------------------------------------------------------------------- */
/*                               Upload helpers                               */
/* -------------------------------------------------------------------------- */

const uploadSingleFile = async (file: File, folder: string, customName?: string): Promise<string> => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const ext = file.name.split(".").pop()
  const baseName = customName ?? file.name.replace(/\.[^/.]+$/, "")
  const fullPath = `${folder}/${timestamp}_${randomString}_${baseName}.${ext}`

  const fileRef = ref(storage, fullPath)
  const snap = await uploadBytes(fileRef, file)
  return getDownloadURL(snap.ref)
}

export const uploadPortfolioImage = async (file: File): Promise<{ url: string }> => {
  const check = validatePortfolioImage(file)
  if (!check.valid) throw new Error(check.error)
  return { url: await uploadSingleFile(file, "portfolio") }
}

export const uploadDocument = async (file: File, docName: string): Promise<{ url: string }> => {
  const check = validateDocument(file)
  if (!check.valid) throw new Error(check.error)
  return { url: await uploadSingleFile(file, "documents", docName) }
}

/**
 * Convenience helper for bulk image uploads.
 */
export const uploadMultipleImages = async (files: File[], folder = "portfolio"): Promise<{ urls: string[] }> => {
  const urls = await Promise.all(files.map((f) => uploadSingleFile(f, folder)))
  return { urls }
}

/* -------------------------------------------------------------------------- */
/*                               Delete helper                                */
/* -------------------------------------------------------------------------- */

export const deleteImageFromFirebase = async (url: string): Promise<boolean> => {
  try {
    const fileRef = ref(storage, url)
    await deleteObject(fileRef)
    return true
  } catch (err) {
    console.error("Error deleting image from Firebase Storage:", err)
    return false
  }
}

/* -------------------------------------------------------------------------- */
/*                        Aggregated service (optional)                       */
/* -------------------------------------------------------------------------- */

export const FirebaseStorageService = {
  validateImageFile,
  validatePortfolioImage,
  validateDocument,
  uploadPortfolioImage,
  uploadDocument,
  uploadMultipleImages,
  deleteImageFromFirebase,
} as const
