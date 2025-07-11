"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Camera,
  ArrowLeft,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  ImageIcon,
  CheckCheck,
} from "lucide-react"
import Link from "next/link"

export function ChatManager() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")

  const chats = [
    {
      id: 1,
      name: "Ananya Kapoor",
      avatar: "AK",
      lastMessage: "Thank you! Looking forward to the wedding shoot",
      time: "2m ago",
      unread: 0,
      online: true,
      service: "Wedding Photography",
    },
    {
      id: 2,
      name: "Rahul Sharma",
      avatar: "RS",
      lastMessage: "Can we schedule a call to discuss the event details?",
      time: "1h ago",
      unread: 2,
      online: false,
      service: "Corporate Event",
    },
    {
      id: 3,
      name: "Meera Patel",
      avatar: "MP",
      lastMessage: "Perfect! See you at Juhu Beach at 4 PM",
      time: "3h ago",
      unread: 0,
      online: true,
      service: "Maternity Shoot",
    },
    {
      id: 4,
      name: "Vikram Singh",
      avatar: "VS",
      lastMessage: "Could you send me some sample engagement photos?",
      time: "1d ago",
      unread: 1,
      online: false,
      service: "Engagement Shoot",
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "client",
      message: "Hi Priya! I saw your portfolio and I'm interested in booking you for my wedding on December 28th.",
      time: "10:30 AM",
      status: "read",
    },
    {
      id: 2,
      sender: "me",
      message:
        "Hello Ananya! Thank you for reaching out. I'd love to discuss your wedding photography needs. December 28th is available. Could you tell me more about your vision?",
      time: "10:35 AM",
      status: "read",
    },
    {
      id: 3,
      sender: "client",
      message:
        "We're planning a traditional ceremony at Taj Palace, Mumbai. Around 150 guests. I love your candid style, especially the sunset beach shots in your portfolio.",
      time: "10:40 AM",
      status: "read",
    },
    {
      id: 4,
      sender: "me",
      message:
        "That sounds beautiful! Taj Palace is a stunning venue. For a wedding of this scale, I offer full-day coverage including pre-wedding preparations, ceremony, and reception. Would you like me to send you my wedding package details?",
      time: "10:45 AM",
      status: "read",
    },
    {
      id: 5,
      sender: "client",
      message: "Yes, please! Also, would it be possible to include a pre-wedding shoot?",
      time: "10:50 AM",
      status: "read",
    },
    {
      id: 6,
      sender: "me",
      message:
        "I have a comprehensive wedding package that includes a pre-wedding shoot. Let me send you the details and we can schedule a call to discuss everything.",
      time: "10:55 AM",
      status: "delivered",
    },
    {
      id: 7,
      sender: "client",
      message: "Thank you! Looking forward to the wedding shoot",
      time: "11:00 AM",
      status: "delivered",
    },
  ]

  const selectedChatData = chats.find((chat) => chat.id === selectedChat)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Chat List - Mobile/Desktop */}
      <div className={`${selectedChat && "hidden md:block"} w-full md:w-80 bg-white border-r`}>
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Link href="/partner/dashboard" className="md:hidden">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-lg font-semibold">Messages</h1>
            </div>
            <Badge variant="secondary">{chats.filter((chat) => chat.unread > 0).length}</Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat === chat.id ? "bg-blue-50 border-r-2 border-r-blue-600" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{chat.avatar}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>

                  <p className="text-sm text-gray-600 truncate mb-1">{chat.lastMessage}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {chat.service}
                    </Badge>
                    {chat.unread > 0 && <Badge className="bg-blue-600 text-white text-xs">{chat.unread}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className={`${!selectedChat && "hidden"} flex-1 flex flex-col bg-white`}>
          {/* Chat Header */}
          <div className="border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">{selectedChatData?.avatar}</AvatarFallback>
                </Avatar>
                {selectedChatData?.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              <div>
                <h2 className="font-semibold">{selectedChatData?.name}</h2>
                <p className="text-sm text-gray-600">{selectedChatData?.service}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === "me" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div
                    className={`flex items-center justify-end space-x-1 mt-1 ${
                      msg.sender === "me" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === "me" && (
                      <CheckCheck className={`h-3 w-3 ${msg.status === "read" ? "text-blue-200" : "text-blue-300"}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // Handle send message
                    setMessage("")
                  }
                }}
              />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-600">Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
