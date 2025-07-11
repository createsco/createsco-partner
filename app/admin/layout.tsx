import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import AdminLayoutClient from "./AdminLayoutClient"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Createsco Admin",
  description: "Createsco Admin Dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
