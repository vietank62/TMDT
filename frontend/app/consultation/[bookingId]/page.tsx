'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Send,
  Star,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Booking, ExpertProfile, SessionToken } from '@/types'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { useAgoraCall } from '@/hooks/useAgoraCall'

interface ChatMessage { id: string; sender: string; text: string; time: string }

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ConsultationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)
  const router = useRouter()
  const { user, initialized } = useAuth()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [session, setSession] = useState<SessionToken | null>(null)
  const [loadError, setLoadError] = useState('')
  const [duration, setDuration] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [screenOn, setScreenOn] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const screenTrackRef = useRef<{ stop: () => void } | null>(null)

  const {
    joined: agoraJoined,
    connecting: agoraConnecting,
    error: agoraError,
    micOn,
    camOn,
    hasRemoteUser,
    localVideoRef,
    remoteVideoRef,
    toggleMic,
    toggleCam,
    leave: agoraLeave,
  } = useAgoraCall(session)

  useEffect(() => {
    if (initialized && !user) {
      router.replace(`/sign-in?from=${encodeURIComponent(`/consultation/${bookingId}`)}`)
    }
  }, [initialized, user, bookingId, router])

  // Load booking + session token on mount.
  useEffect(() => {
    if (!initialized || !user) return
    let mounted = true
    async function load() {
      try {
        const bookingData = await api.bookings.byId(bookingId)
        const [expertData, tokenData] = await Promise.all([
          api.experts.byId(bookingData.expertId).catch(() => null),
          api.bookings.sessionToken(bookingId),
        ])
        if (mounted) {
          setBooking(bookingData)
          setExpert(expertData)
          setSession(tokenData)
          setMessages([{
            id: '1',
            sender: 'system',
            text: 'Phiên tư vấn đã sẵn sàng. Đang kết nối...',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          }])
        }
      } catch (err) {
        if (mounted) setLoadError(err instanceof Error ? err.message : 'Không thể tải phiên tư vấn')
      }
    }
    load()
    return () => { mounted = false }
  }, [bookingId, initialized, user])

  // Add system message when Agora connects.
  useEffect(() => {
    if (!agoraJoined) return
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const id = setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: 'connected',
        sender: 'system',
        text: 'Đã kết nối thành công.',
        time,
      }])
    }, 0)
    return () => clearTimeout(id)
  }, [agoraJoined])

  // Session duration timer.
  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  function sendMessage() {
    if (!newMsg.trim()) return
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      sender: 'user',
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }])
    setNewMsg('')
  }

  async function toggleScreen() {
    if (!agoraJoined) return
    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
    if (screenOn) {
      screenTrackRef.current?.stop()
      screenTrackRef.current = null
      setScreenOn(false)
    } else {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable')
        const track = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack
        screenTrackRef.current = { stop: () => track.close() }
        setScreenOn(true)
      } catch {
        // User cancelled screen picker or permission denied — silently ignore.
      }
    }
  }

  async function handleEndCall() {
    screenTrackRef.current?.stop()
    await agoraLeave()
    setShowReview(true)
  }

  async function submitReview() {
    if (!booking || rating === 0) return
    await api.reviews.create({ booking_id: booking.id, rating, comment: reviewText })
    setReviewSubmitted(true)
  }

  const connectionLabel = loadError
    ? loadError
    : agoraError
      ? agoraError
      : agoraConnecting
        ? 'Đang kết nối...'
        : agoraJoined
          ? 'Đang trực tiếp'
          : 'Đang chuẩn bị...'

  const isLive = agoraJoined && !agoraError

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {isLive
            ? <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            : agoraError || loadError
              ? <WifiOff className="h-4 w-4 text-red-400" />
              : <Wifi className="h-4 w-4 text-slate-400 animate-pulse" />
          }
          <span className="text-white text-sm font-medium">{connectionLabel}</span>
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-300 text-sm font-mono">{formatDuration(duration)}</span>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleEndCall}
          className="flex items-center gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          Kết thúc
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: participants */}
        <div className="w-56 shrink-0 border-r border-slate-700 bg-slate-800 p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Chuyên gia</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={expert?.profilePictureUrl} />
                <AvatarFallback>{expert?.displayName?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{expert?.displayName ?? 'Chuyên gia'}</p>
                <p className="text-xs text-slate-400">{expert?.title}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Người dùng</p>
            <p className="text-sm font-medium text-white">
              #{booking?.userId.slice(0, 8) ?? '...'}
            </p>
          </div>
          <div className="mt-auto">
            <p className="text-xs text-slate-400 mb-1">Chủ đề</p>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
              {booking?.problemDescription ?? 'Buổi tư vấn trực tuyến'}
            </p>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 flex flex-col bg-slate-950 p-4 gap-4 relative">
          {/* Remote video — full area */}
          <div className="flex-1 rounded-xl bg-slate-800 relative overflow-hidden">
            {/* Agora renders remote video into this div */}
            <div ref={remoteVideoRef} className="absolute inset-0" />

            {/* Overlay when no remote user yet */}
            {!hasRemoteUser && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-slate-600">
                    <AvatarImage src={expert?.profilePictureUrl} />
                    <AvatarFallback className="text-3xl bg-slate-700 text-slate-300">
                      {expert?.displayName?.[0] ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium">{expert?.displayName ?? 'Chuyên gia'}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="text-slate-400 text-xs">Đang chờ tham gia...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Local video — picture-in-picture */}
          <div className="absolute bottom-8 right-8 h-32 w-48 rounded-xl bg-slate-700 overflow-hidden shadow-lg border border-slate-600">
            {/* Agora renders local camera into this div */}
            <div ref={localVideoRef} className="absolute inset-0" />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <VideoOff className="h-6 w-6 text-slate-400" />
                <span className="text-slate-400 text-xs">Camera tắt</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="w-64 shrink-0 border-l border-slate-700 bg-slate-800 flex flex-col">
          <div className="px-3 py-2.5 border-b border-slate-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-white">Chat</span>
          </div>
          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'rounded-xl px-3 py-2 max-w-[85%]',
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.sender === 'system'
                        ? 'bg-slate-900 text-slate-400 text-xs italic'
                        : 'bg-slate-700 text-slate-200',
                  )}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={cn(
                      'text-xs mt-0.5',
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500',
                    )}>{msg.time}</p>
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

      {/* Control bar */}
      <div className="border-t border-slate-700 bg-slate-800 px-4 py-3 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full',
            micOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white hover:bg-red-700',
          )}
          onClick={() => void toggleMic()}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full',
            camOn ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-red-600 text-white hover:bg-red-700',
          )}
          onClick={() => void toggleCam()}
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'h-12 w-12 rounded-full',
            screenOn ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600',
          )}
          onClick={() => void toggleScreen()}
        >
          {screenOn ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </Button>
        <Button
          className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
          onClick={() => void handleEndCall()}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {/* End-call / review dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewSubmitted ? 'Cảm ơn bạn!' : 'Đánh giá buổi tư vấn'}
            </DialogTitle>
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
                      <Star className={cn(
                        'h-8 w-8 transition-colors',
                        (hoverRating || rating) > i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
                      )} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Nhận xét của bạn</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => void submitReview()} disabled={rating === 0}>
                  Gửi đánh giá
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/consultations')}>
                  Bỏ qua
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
