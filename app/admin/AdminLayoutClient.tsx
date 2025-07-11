"use client"

import type React from "react"
import { AdminAuthProvider } from "@/contexts/admin-auth-context"

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
