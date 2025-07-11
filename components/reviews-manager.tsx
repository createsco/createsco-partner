"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, ArrowLeft, Star, MessageCircle, ThumbsUp, Share2, Filter, Search, Award } from "lucide-react"
import Link from "next/link"

export function ReviewsManager() {
  const [selectedFilter, setSelectedFilter] = useState("all")

  const reviews = [
    {
      id: 1,
      clientName: "Ananya Kapoor",
      clientAvatar: "AK",
      rating: 5,
      date: "Dec 20, 2024",
      service: "Wedding Photography",
      review:
        "Priya exceeded all our expectations! Her candid shots captured the emotions perfectly. The pre-wedding consultation was thorough and she made us feel comfortable throughout the day. Highly recommend!",
      helpful: 12,
      photos: 3,
      response: null,
    },
    {
      id: 2,
      clientName: "Rahul Sharma",
      clientAvatar: "RS",
      rating: 4,
      date: "Dec 15, 2024",
      service: "Corporate Event",
      review:
        "Professional service and quick delivery. The headshots came out great and the event coverage was comprehensive. Only minor feedback would be more variety in poses for headshots.",
      helpful: 8,
      photos: 1,
      response:
        "Thank you Rahul! I appreciate the feedback and will definitely incorporate more pose variations in future headshot sessions.",
    },
    {
      id: 3,
      clientName: "Meera Patel",
      clientAvatar: "MP",
      rating: 5,
      date: "Dec 10, 2024",
      service: "Maternity Shoot",
      review:
        "Beautiful maternity photos! Priya made me feel so comfortable and confident. The golden hour timing was perfect and the editing is stunning. Can't wait to book her for newborn photos!",
      helpful: 15,
      photos: 4,
      response:
        "Thank you so much Meera! It was such a joy capturing this special time. Looking forward to your newborn session!",
    },
    {
      id: 4,
      clientName: "Vikram Singh",
      clientAvatar: "VS",
      rating: 5,
      date: "Dec 5, 2024",
      service: "Engagement Shoot",
      review:
        "Amazing photographer! Very creative with poses and locations. Made our engagement shoot fun and memorable. The photos turned out better than we imagined!",
      helpful: 9,
      photos: 2,
      response: null,
    },
    {
      id: 5,
      clientName: "Priya Gupta",
      clientAvatar: "PG",
      rating: 4,
      date: "Nov 28, 2024",
      service: "Birthday Party",
      review:
        "Great with kids! Captured all the special moments of my daughter's birthday. Very patient and professional. Photos were delivered on time.",
      helpful: 6,
      photos: 1,
      response: "Thank you Priya! Your daughter was such a delight to photograph. Happy she had a wonderful birthday!",
    },
  ]

  const stats = {
    totalReviews: 89,
    averageRating: 4.8,
    fiveStars: 76,
    fourStars: 11,
    threeStars: 2,
    twoStars: 0,
    oneStars: 0,
    responseRate: "95%",
  }

  const filteredReviews =
    selectedFilter === "all" ? reviews : reviews.filter((review) => review.rating === Number.parseInt(selectedFilter))

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
            <h1 className="text-lg font-semibold">Reviews</h1>
          </div>
          <Badge variant="secondary">{stats.totalReviews}</Badge>
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
            <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
              <div className="flex justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="text-xs text-gray-600">Average Rating</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
              <div className="text-xs text-gray-600">Total Reviews</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-green-600">{stats.responseRate}</div>
              <div className="text-xs text-gray-600">Response Rate</div>
            </div>
          </Card>
          <Card className="p-3 md:p-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-purple-600">{stats.fiveStars}</div>
              <div className="text-xs text-gray-600">5-Star Reviews</div>
            </div>
          </Card>
        </div>

        {/* Rating Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Rating Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  rating === 5
                    ? stats.fiveStars
                    : rating === 4
                      ? stats.fourStars
                      : rating === 3
                        ? stats.threeStars
                        : rating === 2
                          ? stats.twoStars
                          : stats.oneStars
                const percentage = (count / stats.totalReviews) * 100

                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex flex-wrap gap-2">
                {["all", "5", "4", "3", "2", "1"].map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="text-xs md:text-sm"
                  >
                    {filter === "all" ? "All Reviews" : `${filter} Stars`}
                  </Button>
                ))}
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{review.clientAvatar}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{review.clientName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 md:h-4 md:w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {review.service}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-0">{review.date}</div>
                    </div>

                    <p className="text-sm md:text-base text-gray-700 mb-3 leading-relaxed">{review.review}</p>

                    {review.photos > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex space-x-1">
                          {[...Array(review.photos)].map((_, i) => (
                            <div key={i} className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-lg"></div>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">+{review.photos} photos</span>
                      </div>
                    )}

                    {review.response && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-600 text-white text-xs">PS</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">Your Response</span>
                        </div>
                        <p className="text-sm text-gray-700">{review.response}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{review.helpful} helpful</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>

                      {!review.response && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Respond to {review.clientName}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-medium">{review.clientName}</span>
                                </div>
                                <p className="text-sm text-gray-700">{review.review}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Your Response</label>
                                <Textarea
                                  placeholder="Thank you for the wonderful review! It was a pleasure working with you..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex space-x-3">
                                <Button className="flex-1">Post Response</Button>
                                <Button variant="outline">Cancel</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
