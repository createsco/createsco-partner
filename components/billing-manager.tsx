"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  ArrowLeft,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react"
import Link from "next/link"

export function BillingManager() {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month")

  const earnings = {
    thisMonth: "₹45,280",
    lastMonth: "₹38,950",
    thisYear: "₹4,85,600",
    pending: "₹12,500",
    available: "₹32,780",
  }

  const transactions = [
    {
      id: 1,
      clientName: "Ananya Kapoor",
      service: "Wedding Photography",
      amount: "₹35,000",
      commission: "₹3,500",
      netAmount: "₹31,500",
      date: "Dec 20, 2024",
      status: "completed",
      paymentMethod: "Bank Transfer",
      bookingId: "BK001",
    },
    {
      id: 2,
      clientName: "TechCorp Solutions",
      service: "Corporate Event",
      amount: "₹18,000",
      commission: "₹1,800",
      netAmount: "₹16,200",
      date: "Dec 18, 2024",
      status: "completed",
      paymentMethod: "UPI",
      bookingId: "BK002",
    },
    {
      id: 3,
      clientName: "Meera Patel",
      service: "Maternity Shoot",
      amount: "₹10,000",
      commission: "₹1,000",
      netAmount: "₹9,000",
      date: "Dec 15, 2024",
      status: "pending",
      paymentMethod: "Bank Transfer",
      bookingId: "BK003",
    },
    {
      id: 4,
      clientName: "Vikram Singh",
      service: "Engagement Shoot",
      amount: "₹12,000",
      commission: "₹1,200",
      netAmount: "₹10,800",
      date: "Dec 12, 2024",
      status: "processing",
      paymentMethod: "UPI",
      bookingId: "BK004",
    },
  ]

  const statusColors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    failed: "bg-red-100 text-red-800",
  }

  const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    processing: AlertCircle,
    failed: AlertCircle,
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
            <h1 className="text-lg font-semibold">Billing</h1>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {/* Earnings Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-6">
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-green-600">{earnings.thisMonth}</div>
              <div className="text-xs md:text-sm text-gray-600">This Month</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-600">{earnings.available}</div>
              <div className="text-xs md:text-sm text-gray-600">Available</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-yellow-600">{earnings.pending}</div>
              <div className="text-xs md:text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-gray-600">{earnings.lastMonth}</div>
              <div className="text-xs md:text-sm text-gray-600">Last Month</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-purple-600">{earnings.thisYear}</div>
              <div className="text-xs md:text-sm text-gray-600">This Year</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Withdraw Earnings</h3>
                <p className="text-sm text-gray-600">Transfer available balance</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <p className="text-sm text-gray-600">Manage bank accounts</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Tax Documents</h3>
                <p className="text-sm text-gray-600">Download tax forms</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex flex-wrap gap-2">
                    {["this-month", "last-month", "this-year", "all-time"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        className="text-xs md:text-sm"
                      >
                        {period.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const StatusIcon = statusIcons[transaction.status]

                return (
                  <Card key={transaction.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-sm md:text-base">{transaction.clientName}</h3>
                            <Badge className={`text-xs ${statusColors[transaction.status]}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">{transaction.service}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Booking: {transaction.bookingId}</span>
                            <span>{transaction.date}</span>
                            <span>{transaction.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm md:text-base font-semibold text-green-600">
                            {transaction.netAmount}
                          </div>
                          <div className="text-xs text-gray-500">Total: {transaction.amount}</div>
                          <div className="text-xs text-gray-500">Commission: {transaction.commission}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <div className="text-xs text-gray-500">Net earnings after 10% platform fee</div>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Receipt className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Monthly Earnings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">December 2024</span>
                      <span className="font-semibold">₹45,280</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">November 2024</span>
                      <span className="font-semibold">₹38,950</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">October 2024</span>
                      <span className="font-semibold">₹42,100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">September 2024</span>
                      <span className="font-semibold">₹39,800</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Wedding Photography</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Corporate Events</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Portrait Sessions</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                        </div>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">HDFC Bank</h3>
                      <p className="text-sm text-gray-600">****1234 • Primary</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  + Add Payment Method
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto Withdrawal</h3>
                    <p className="text-sm text-gray-600">Automatically transfer earnings weekly</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Minimum Balance</h3>
                    <p className="text-sm text-gray-600">₹1,000</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
