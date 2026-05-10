'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Mic, MicOff, Monitor, MonitorOff, PhoneOff, Video, VideoOff,
  MessageSquare, Send, Clock, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { getBookingById } from '@/data/bookings'
import { getExpertById } from '@/data/experts'
import { mockUsers } from '@/data/users'
import { cn } from '@/lib/utils'

interface ChatMessage { id: string; sender: string; text: string; time: string }

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'expert', text: 'Xin chào! Tôi đã đọc qua mô tả vấn đề của bạn. Hãy bắt đầu nhé!', time: '09:01' },
  { id: '2', sender: 'user', text: 'Cảm ơn anh! Tôi muốn hỏi về việc thiết kế hệ thống phân tán.', time: '09:02' },
  { id: '3', sender: 'expert', text: 'Được, chúng ta sẽ đi qua các khái niệm cơ bản trước. Bạn đang dùng gì hiện tại?', time: '09:03' },
]

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ConsultationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const booking = getBookingById(bookingId)
  const expert = booking ? getExpertById(booking.expertId) : null
  const user = booking ? mockUsers.find((u) => u.id === booking.userId) : null

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)
  const [duration, setDuration] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES)
  const [newMsg, setNewMsg] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  function sendMessage() {
    if (!newMsg.trim()) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: newMsg.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }])
    setNewMsg('')
  }

  function endCall() {
    setShowReview(true)
  }

  async function submitReview() {
    await new Promise((r) => setTimeout(r, 600))
    setReviewSubmitted(true)
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-sm font-medium">Đang kết nối trực tiếp</span>
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-300 text-sm font-mono">{formatDuration(duration)}</span>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={endCall}
          className="flex items-center gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          Kết thúc
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Session info */}
        <div className="w-56 shrink-0 border-r border-slate-700 bg-slate-800 p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Chuyên gia</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={expert?.profilePictureUrl} />
                <AvatarFallback>{expert?.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{expert?.displayName ?? 'Chuyên gia'}</p>
                <p className="text-xs text-slate-400">{expert?.title}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Người dùng</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.fullName[0]}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-white">{user?.fullName ?? 'Người dùng'}</p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-slate-400 mb-1">Chủ đề</p>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
              {booking?.problemDescription ?? 'Buổi tư vấn trực tuyến'}
            </p>
          </div>
        </div>

        {/* Center: Video */}
        <div className="flex-1 flex flex-col bg-slate-950 p-4 gap-4">
          {/* Remote video (Expert) */}
          <div className="flex-1 rounded-xl bg-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-green-500">
                  <AvatarImage src={expert?.profilePictureUrl} />
                  <AvatarFallback className="text-3xl">{expert?.displayName[0]}</AvatarFallback>
                </Avatar>
                <p className="text-white font-medium">{expert?.displayName}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-green-400 text-xs">Đang kết nối</span>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/50 rounded px-2 py-1">
              <span className="text-white text-xs">{expert?.displayName} (Chuyên gia)</span>
            </div>
          </div>

          {/* Local video (User) - small */}
          <div className="h-28 rounded-xl bg-slate-700 relative overflow-hidden flex items-center justify-center self-end w-40">
            {camOn ? (
              <div className="text-center">
                <Avatar className="h-10 w-10 mx-auto">
                  <AvatarFallback>{user?.fullName[0]}</AvatarFallback>
                </Avatar>
                <p className="text-white text-xs mt-1">Bạn</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <VideoOff className="h-6 w-6 text-slate-400" />
                <span className="text-slate-400 text-xs">Camera tắt</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <div className="w-64 shrink-0 border-l border-slate-700 bg-slate-800 flex flex-col">
          <div className="px-3 py-2.5 border-b border-slate-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-white">Chat</span>
          </div>
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('rounded-xl px-3 py-2 max-w-[85%]', msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200')}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={cn('text-xs mt-0.5', msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400')}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="px-3 py-2.5 border-t border-slate-700 flex gap-2">
            <Input
              placeholder="Nhắn tin..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 text-sm"
            />
            <Button size="icon" onClick={sendMessage} className="shrink-0 h-9 w-9">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="border-t border-slate-700 bg-slate-800 px-4 py-3 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          className={cn('h-12 w-12 rounded-full', micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white hover:bg-red-700')}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          className={cn('h-12 w-12 rounded-full', camOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white hover:bg-red-700')}
          onClick={() => setCamOn(!camOn)}
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          className={cn('h-12 w-12 rounded-full', screenOn ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600')}
          onClick={() => setScreenOn(!screenOn)}
        >
          {screenOn ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>
        <Button
          className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
          onClick={endCall}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {/* Review dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewSubmitted ? 'Cảm ơn bạn!' : 'Đánh giá buổi tư vấn'}</DialogTitle>
          </DialogHeader>
          {reviewSubmitted ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Đánh giá của bạn đã được gửi thành công!</p>
              <Button asChild>
                <Link href="/dashboard/consultations">Về trang chủ</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Mức độ hài lòng</Label>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(i + 1)}
                    >
                      <Star className={cn('h-8 w-8 transition-colors', (hoverRating || rating) > i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Nhận xét của bạn</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Chia sẻ trải nghiệm của bạn về buổi tư vấn..."
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={submitReview} disabled={rating === 0}>
                  Gửi đánh giá
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/consultations">Bỏ qua</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
