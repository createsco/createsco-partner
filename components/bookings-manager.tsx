"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Camera,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  CheckCircle,
  Upload,
  MessageCircle,
  Navigation,
  Star,
  Download,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"

export function BookingsManager() {
  const [selectedTab, setSelectedTab] = useState("upcoming")

  const bookings = [
    {
      id: 1,
      clientName: "Ananya & Vikram",
      clientAvatar: "AV",
      service: "Wedding Photography",
      date: "Dec 28, 2024",
      time: "10:00 AM - 8:00 PM",
      location: "Taj Palace, Mumbai",
      amount: "₹35,000",
      status: "confirmed",
      phone: "+91 98765 43210",
      email: "ananya.kapoor@email.com",
      guests: 150,
      requirements: ["Full day coverage", "Pre-wedding shoot", "Album design"],
      notes: "Bride prefers candid shots. Groom's family wants traditional poses.",
      paymentStatus: "advance_paid",
      advanceAmount: "₹15,000",
      balanceAmount: "₹20,000",
      contract: "signed",
    },
    {
      id: 2,
      clientName: "TechCorp Solutions",
      clientAvatar: "TC",
      service: "Corporate Event",
      date: "Dec 30, 2024",
      time: "2:00 PM - 6:00 PM",
      location: "Bandra Kurla Complex",
      amount: "₹18,000",
      status: "confirmed",
      phone: "+91 87654 32109",
      email: "events@techcorp.com",
      guests: 50,
      requirements: ["Event coverage", "Professional headshots"],
      notes: "Need photos delivered within 24 hours for social media.",
      paymentStatus: "full_paid",
      advanceAmount: "₹18,000",
      balanceAmount: "₹0",
      contract: "signed",
    },
    {
      id: 3,
      clientName: "Meera Patel",
      clientAvatar: "MP",
      service: "Maternity Shoot",
      date: "Jan 5, 2025",
      time: "4:00 PM - 6:00 PM",
      location: "Juhu Beach, Mumbai",
      amount: "₹10,000",
      status: "pending",
      phone: "+91 76543 21098",
      email: "meera.patel@email.com",
      guests: 2,
      requirements: ["Outdoor shoot", "Golden hour", "Edited photos"],
      notes: "First time maternity shoot. Wants natural, comfortable poses.",
      paymentStatus: "pending",
      advanceAmount: "₹0",
      balanceAmount: "₹10,000",
      contract: "pending",
    },
  ]

  const completedBookings = [
    {
      id: 4,
      clientName: "Rajesh & Priya",
      clientAvatar: "RP",
      service: "Wedding Photography",
      date: "Dec 15, 2024",
      time: "9:00 AM - 11:00 PM",
      location: "Grand Ballroom, Delhi",
      amount: "₹45,000",
      status: "completed",
      rating: 5,
      review: "Absolutely amazing work! Captured every moment perfectly.",
      deliveryStatus: "delivered",
      photosCount: 450,
    },
    {
      id: 5,
      clientName: "StartupHub",
      clientAvatar: "SH",
      service: "Corporate Headshots",
      date: "Dec 10, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "Powai Office Complex",
      amount: "₹12,000",
      status: "completed",
      rating: 4,
      review: "Professional service, quick delivery. Will book again.",
      deliveryStatus: "delivered",
      photosCount: 85,
    },
  ]

  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const paymentStatusColors = {
    full_paid: "bg-green-100 text-green-800",
    advance_paid: "bg-yellow-100 text-yellow-800",
    pending: "bg-red-100 text-red-800",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b sticky top-0 z-40 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">My Bookings</h1>
          </div>
          <Badge variant="secondary">{bookings.length + completedBookings.length}</Badge>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="bg-white border-b sticky top-0 z-40 hidden md:block">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/partner/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Camera className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-600">{bookings.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Upcoming</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-green-600">{completedBookings.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Completed</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-purple-600">₹63K</div>
              <div className="text-xs md:text-sm text-gray-600">This Month</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-yellow-600">4.8</div>
              <div className="text-xs md:text-sm text-gray-600">Avg Rating</div>
            </div>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border">
            <TabsTrigger value="upcoming" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">{booking.clientAvatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{booking.clientName}</h3>
                        <p className="text-xs md:text-sm text-gray-600">{booking.service}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${statusColors[booking.status]}`}>{booking.status}</Badge>
                          <Badge className={`text-xs ${paymentStatusColors[booking.paymentStatus]}`}>
                            {booking.paymentStatus.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm md:text-base font-semibold text-green-600">{booking.amount}</div>
                      <div className="text-xs text-gray-500">
                        {booking.paymentStatus === "advance_paid" && `Balance: ${booking.balanceAmount}`}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {booking.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                {booking.clientAvatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold">{booking.clientName}</h2>
                              <p className="text-gray-600">{booking.service}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                                <Badge className={paymentStatusColors[booking.paymentStatus]}>
                                  {booking.paymentStatus.replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold mb-3">Event Details</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{booking.date}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{booking.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{booking.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span>{booking.guests} guests</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-3">Contact & Payment</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{booking.phone}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span>{booking.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-gray-400" />
                                  <span>Total: {booking.amount}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-gray-400" />
                                  <span>Advance: {booking.advanceAmount}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Requirements</h3>
                            <div className="flex flex-wrap gap-2">
                              {booking.requirements.map((req, index) => (
                                <Badge key={index} variant="secondary">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
                          </div>

                          <div className="flex space-x-3">
                            <Button className="flex-1">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message Client
                            </Button>
                            <Button variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </Button>
                            <Button variant="outline">
                              <Navigation className="h-4 w-4 mr-2" />
                              Directions
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarFallback className="bg-green-100 text-green-600">{booking.clientAvatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{booking.clientName}</h3>
                        <p className="text-xs md:text-sm text-gray-600">{booking.service}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${statusColors[booking.status]}`}>{booking.status}</Badge>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < booking.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                            <span className="text-xs text-gray-600 ml-1">{booking.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm md:text-base font-semibold text-green-600">{booking.amount}</div>
                      <div className="text-xs text-gray-500">{booking.photosCount} photos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="truncate">{booking.location}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-xs md:text-sm text-gray-700 italic">"{booking.review}"</p>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      View Gallery
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
