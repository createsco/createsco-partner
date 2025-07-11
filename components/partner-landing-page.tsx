"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Camera,
  Star,
  Users,
  TrendingUp,
  Shield,
  Menu,
  CheckCircle,
  ArrowRight,
  Play,
  DollarSign,
  Clock,
  Award,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function PartnerLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>

            <Link href="/" className="flex items-center space-x-1">
              <span className="text-2xl font-semibold text-gray-900">Createsco</span>
              <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Partners</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#benefits" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Benefits
            </Link>
            <Link href="#success-stories" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Success Stories
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              How it works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              FAQ
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
                <Link href="#benefits" className="text-gray-600 hover:text-gray-900 font-medium">
                  Benefits
                </Link>
                <Link href="#success-stories" className="text-gray-600 hover:text-gray-900 font-medium">
                  Success Stories
                </Link>
                <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">
                  How it works
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                  Pricing
                </Link>
                <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium">
                  FAQ
                </Link>
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

      {/* Hero Section for Partners - Simplified */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 leading-tight">
                Grow your
                <br />
                photography business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join India's most trusted photography marketplace. Connect with thousands of clients, showcase your
                portfolio, and build a thriving photography business.
              </p>

              {/* Hero Section Buttons - Simplified */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full shadow-sm transition-all duration-200 hover:shadow-md">
                  <Link href="/partner/signup" className="w-full h-full flex items-center justify-center">
                    Start earning today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </button>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 hover:border-gray-900 bg-white text-gray-700 hover:text-gray-900 font-medium rounded-full transition-colors">
                  <Play className="mr-2 h-5 w-5" />
                  Watch success stories
                </button>
              </div>

              {/* Quick Benefits - Simplified */}
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>40% average increase in bookings</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>Secure payments guaranteed</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span>No setup fees or hidden costs</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-3xl p-6">
                <img
                  src="/professional-photographer.png"
                  alt="Professional photographer"
                  className="w-full h-auto rounded-2xl"
                />
              </div>

              {/* Floating Stats Cards - Simplified */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">₹2.5L+</div>
                    <div className="text-sm text-gray-600">Avg. monthly earnings</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">1,200+</div>
                    <div className="text-sm text-gray-600">Active partners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-semibold text-gray-900 mb-2">1,200+</div>
              <div className="text-gray-600">Active Partners</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-gray-900 mb-2">50,000+</div>
              <div className="text-gray-600">Client Bookings</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-gray-900 mb-2">120+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Partner Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">Why photographers choose Createsco</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to grow your photography business and increase your revenue
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Verified Client Base</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Access thousands of verified clients actively looking for photography services in your area.
                </p>
                <div className="text-sm text-blue-600 font-medium">50,000+ active clients</div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Increase Your Revenue</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Partners see an average 40% increase in bookings within the first 3 months of joining.
                </p>
                <div className="text-sm text-green-600 font-medium">40% average growth</div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Payments</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Guaranteed payments with our secure escrow system and comprehensive fraud protection.
                </p>
                <div className="text-sm text-purple-600 font-medium">100% payment security</div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">24/7 Support</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Dedicated partner support team available round the clock to help you succeed.
                </p>
                <div className="text-sm text-orange-600 font-medium">Always here to help</div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">AI-Powered Tools</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Smart recommendations and insights to optimize your profile and increase visibility.
                </p>
                <div className="text-sm text-red-600 font-medium">Smart optimization</div>
              </CardContent>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-gray-100 rounded-2xl bg-white">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Build Your Brand</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Professional portfolio showcase and review system to build your reputation.
                </p>
                <div className="text-sm text-indigo-600 font-medium">Professional presence</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories - Redesigned */}
      <section id="success-stories" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">Success stories from our partners</h2>
            <p className="text-xl text-gray-600">
              Hear from photographers who've transformed their business with Createsco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="p-6 border-gray-100 rounded-2xl bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">PS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Priya Sharma</div>
                    <div className="text-sm text-gray-500">Wedding Photographer</div>
                    <div className="text-xs text-gray-400">Mumbai</div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">5.0</span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  "Createsco has been a game-changer for my photography business. I've tripled my bookings and connected
                  with amazing clients across Mumbai."
                </p>

                <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">3x</div>
                  <div className="text-sm text-green-700 font-medium">Increase in bookings</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="p-6 border-gray-100 rounded-2xl bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-lg">AR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Arjun Reddy</div>
                    <div className="text-sm text-gray-500">Corporate Photographer</div>
                    <div className="text-xs text-gray-400">Delhi</div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">5.0</span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  "The platform is incredibly user-friendly and the AI suggestions have helped me optimize my profile.
                  My revenue increased by 60% in just 4 months!"
                </p>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">60%</div>
                  <div className="text-sm text-blue-700 font-medium">Revenue increase</div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="p-6 border-gray-100 rounded-2xl bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-semibold text-sm">LL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Lens & Light Studio</div>
                    <div className="text-sm text-gray-500">Commercial Studio</div>
                    <div className="text-xs text-gray-400">Bangalore</div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">5.0</span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                  "As a studio owner, Createsco has helped us reach clients we never could before. The booking
                  management system is fantastic!"
                </p>

                <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">200+</div>
                  <div className="text-sm text-purple-700 font-medium">New clients monthly</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Create Your Profile</h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up and create your professional profile with portfolio, services, and pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Get Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete our quick verification process to build trust with potential clients.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-semibold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Start Earning</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive booking requests, connect with clients, and grow your photography business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. No setup costs. Only pay when you earn.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 border-gray-100 rounded-2xl bg-white text-center">
              <CardContent className="p-0">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Commission-based pricing</h3>
                <div className="text-5xl font-semibold text-gray-900 mb-2">8-12%</div>
                <div className="text-gray-600 mb-6">Commission on successful bookings</div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>No setup fees or monthly charges</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Lower rates for high-volume partners</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>24-hour payment processing</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>Multiple payment methods supported</span>
                  </div>
                </div>

                {/* Pricing Section Button */}
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-4 rounded-full shadow-sm transition-all hover:shadow-md"
                  asChild
                >
                  <Link href="/partner/signup">Start earning today</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about becoming a Createsco partner</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6 border-gray-100 rounded-2xl">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">How do I get verified on Createsco?</h3>
                <p className="text-gray-600">
                  Our verification process includes document verification (Aadhar), portfolio review, and a brief
                  interview. Most applications are processed within 24-48 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-gray-100 rounded-2xl">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">What commission does Createsco charge?</h3>
                <p className="text-gray-600">
                  We charge a competitive 8-12% commission on successful bookings, with lower rates for high-volume
                  partners. No hidden fees or setup costs.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-gray-100 rounded-2xl">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">How quickly do I receive payments?</h3>
                <p className="text-gray-600">
                  Payments are processed within 24 hours of shoot completion and client approval. We offer multiple
                  payment methods including bank transfer and UPI.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-gray-100 rounded-2xl">
              <CardContent className="p-0">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Can I set my own pricing?</h3>
                <p className="text-gray-600">
                  Yes! You have complete control over your pricing. Our AI tools provide market insights to help you
                  price competitively while maximizing your earnings.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold text-white mb-4">Ready to transform your photography business?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful photographers already growing their business with Createsco
          </p>
          {/* Final CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/partner/signup"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-4 rounded-full shadow-sm transition-all hover:shadow-md"
            >
              Join as Partner
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/partner/login"
              className="inline-flex items-center justify-center border-2 border-gray-400 hover:border-gray-300 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-full transition-all duration-200"
            >
              Already a partner? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Createsco</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                India's most trusted photography marketplace connecting photographers with verified clients.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">For Partners</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="/partner/signup" className="hover:text-gray-900 transition-colors">
                    Join as Partner
                  </Link>
                </li>
                <li>
                  <Link href="/partner/login" className="hover:text-gray-900 transition-colors">
                    Partner Login
                  </Link>
                </li>
                <li>
                  <Link href="#success-stories" className="hover:text-gray-900 transition-colors">
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Partner Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Safety
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    Partner Agreement
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Createsco. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
