"use client"

import Link from "next/link"
import { Menu, Camera } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function PartnerHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
       
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Camera className="h-5 w-5 text-white" />
          </div>
           <Link href="/">
          <span className="text-2xl font-semibold text-gray-900">Createsco</span>
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Partners</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Photographers
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Studios
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            How it works
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Pricing
          </Link>
          <Link href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Blog
          </Link>
        </nav>

        {/* Header Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="inline-flex items-center justify-center px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 text-black font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            <Link href="/partner/login" className="w-full h-full flex items-center justify-center">
              Sign in
            </Link>
          </button>
          <button className="inline-flex items-center justify-center px-6 py-2 border-2 border-black bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            <Link href="/partner/signup" className="w-full h-full flex items-center justify-center">
              Join now
            </Link>
          </button>
        </div>

        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden">
            <nav className="flex flex-col space-y-4 p-6">
            
         

              <hr className="border-gray-100" />
              <button className="w-full inline-flex items-center justify-center border-2 border-black bg-white hover:bg-gray-50 text-black font-medium py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black mb-2">
                <Link href="/partner/login" className="w-full h-full flex items-center justify-center">
                  Sign in
                </Link>
              </button>
              <button className="w-full inline-flex items-center justify-center border-2 border-black bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black">
                <Link href="/partner/signup" className="w-full h-full flex items-center justify-center">
                  Join now
                </Link>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
