'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import BookingStepper from '@/components/booking/BookingStepper'
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar'
import FileUploadDropzone, { BookingFileItem } from '@/components/booking/FileUploadDropzone'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { AvailabilitySlot, ExpertProfile } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

const STEPS = [
  { label: 'Chọn lịch' },
  { label: 'Mô tả vấn đề' },
  { label: 'Tài liệu' },
  { label: 'Xác nhận' },
  { label: 'Chờ duyệt' },
  { label: 'Thành công' },
]

export default function BookingPage({ params }: { params: Promise<{ expertId: string }> }) {
  const { expertId } = use(params)
  const router = useRouter()
  const { user, initialized } = useAuth()
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([])
  const [description, setDescription] = useState('')
  const [goals, setGoals] = useState('')
  const [files, setFiles] = useState<BookingFileItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialized && !user) {
      router.replace(`/sign-in?from=${encodeURIComponent(`/booking/${expertId}`)}`)
    }
  }, [initialized, user, expertId, router])

  useEffect(() => {
    let mounted = true
    api.experts.bySlug(expertId)
      .then(async (data) => {
        if (!data) throw new Error('Không tìm thấy chuyên gia')
        const availability = await api.experts.availability(data.id)
        if (mounted) {
          setExpert(data)
          setSlots(availability)
        }
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setPageLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [expertId])

  const sortedSelected = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const sessionCount = selectedSlots.length
  const totalMinutes = sessionCount * 15
  const totalPrice = (expert?.pricePerSession ?? 0) * sessionCount
  const timeRange = sessionCount > 0
    ? `${sortedSelected.at(0)!.startTime} – ${sortedSelected.at(-1)!.endTime}`
    : '—'

  async function goToNextStep() {
    if (step === 3) {
      setStep(4)
      setLoading(true)
      try {
        await api.bookings.create({
          expert_id: expert!.id,
          slot_ids: selectedSlots.map((slot) => slot.id),
          problem_description: description,
          session_goals: goals,
          document_urls: files.flatMap((file) => (file.status === 'done' && file.url ? [file.url] : [])),
        })
        setStep(5)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu đặt lịch')
        setStep(3)
      } finally {
        setLoading(false)
      }
      return
    }
    setStep((s) => s + 1)
  }

  const uploadsSettled = files.every((file) => file.status === 'done')

  const canProceed =
    (step === 0 && selectedSlots.length > 0) ||
    (step === 1 && description.length >= 20) ||
    (step === 2 && uploadsSettled) ||
    step === 3

  if (pageLoading) {
    return <div className="min-h-screen bg-gray-50 px-4 py-10 text-center text-gray-500">Đang tải...</div>
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 text-center text-red-500">
        {error || 'Không tìm thấy chuyên gia'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/experts/${expert.slug}`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-semibold text-gray-900">Đặt lịch tư vấn</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Stepper */}
        <BookingStepper steps={STEPS} currentStep={step} />

        {/* Expert info card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={expert.profilePictureUrl} />
                <AvatarFallback>{expert.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{expert.displayName}</p>
                <p className="text-sm text-gray-500">{expert.title} · {expert.company}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-blue-600">{formatCurrency(expert.pricePerSession)}</p>
                <p className="text-xs text-gray-400">15 phút / khung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 0 — slot selection */}
        {step === 0 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Bước 1: Chọn khung giờ tư vấn
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  Mỗi khung = 15 phút
                </span>
                <p className="text-xs text-gray-400">
                  Chọn nhiều khung liền kề để kéo dài phiên tư vấn.
                </p>
              </div>
              {slots.length === 0 ? (
                <p className="text-sm text-gray-400">Chuyên gia chưa có lịch rảnh. Vui lòng quay lại sau.</p>
              ) : (
                <AvailabilityCalendar
                  slots={slots}
                  selectedSlots={selectedSlots}
                  onSelectSlots={setSelectedSlots}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 1 — describe problem */}
        {step === 1 && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Bước 2: Mô tả vấn đề cần tư vấn
              </h2>
              <div>
                <Label>Mô tả vấn đề của bạn *</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải và cần được hỗ trợ... (tối thiểu 20 ký tự)"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">{description.length}/20 ký tự tối thiểu</p>
              </div>
              <div>
                <Label>Mục tiêu buổi tư vấn (tùy chọn)</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Bạn muốn đạt được gì sau buổi tư vấn này?"
                  rows={3}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — documents */}
        {step === 2 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Bước 3: Tải lên tài liệu (tùy chọn)</h2>
              <FileUploadDropzone files={files} onFilesChange={setFiles} />
            </CardContent>
          </Card>
        )}

        {/* Step 3 — confirmation */}
        {step === 3 && (
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Bước 4: Xác nhận yêu cầu</h2>
              <div className="space-y-0 text-sm divide-y">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Chuyên gia</span>
                  <span className="font-medium">{expert.displayName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Ngày</span>
                  <span className="font-medium">
                    {sessionCount > 0 ? formatDate(sortedSelected.at(0)!.date) : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Khung giờ</span>
                  <span className="font-medium">{timeRange}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Số khung</span>
                  <span className="font-medium">{sessionCount} khung liên tiếp</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Tổng thời lượng</span>
                  <span className="font-medium">{totalMinutes} phút</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Tài liệu đính kèm</span>
                  <span className="font-medium">{files.length} tập tin</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">
                  Tổng thanh toán
                  {sessionCount > 1 && (
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      ({formatCurrency(expert.pricePerSession)} × {sessionCount})
                    </span>
                  )}
                </span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                Sau khi gửi yêu cầu, chuyên gia có 24 giờ để xem xét. Bạn sẽ có 24 giờ để thanh toán sau khi được chấp nhận.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — pending */}
        {step === 4 && (
          <Card>
            <CardContent className="p-8 text-center">
              {loading && (
                <>
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">Đang gửi yêu cầu...</h3>
                  <p className="text-gray-500 mt-2 text-sm">Chờ chuyên gia xem xét yêu cầu của bạn</p>
                  <div className="mt-4 space-y-1">
                    {['Đang gửi yêu cầu đến chuyên gia...', 'Chuyên gia đang xem xét...', 'Đang xác nhận lịch hẹn...'].map((msg, i) => (
                      <p key={i} className="text-xs text-gray-400">{msg}</p>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 5 — success */}
        {step === 5 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700">Gửi yêu cầu thành công!</h3>
              <p className="text-green-600 mt-2">Yêu cầu của bạn đã được gửi và đang chờ chuyên gia xem xét.</p>
              <div className="rounded-xl bg-white border border-green-200 p-4 mt-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Chuyên gia</span>
                  <span className="font-medium">{expert.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày</span>
                  <span className="font-medium">
                    {sessionCount > 0 ? formatDate(sortedSelected.at(0)!.date) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giờ</span>
                  <span className="font-medium">{timeRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời lượng</span>
                  <span className="font-medium">{totalMinutes} phút</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền cần thanh toán</span>
                  <span className="font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Chuyên gia có 24 giờ để xem xét. Sau khi được chấp nhận, bạn có 24 giờ để thanh toán.</p>
              <div className="flex gap-3 mt-4 justify-center">
                <Button asChild>
                  <Link href="/dashboard/consultations">Xem danh sách tư vấn</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
            </Button>
            <Button onClick={goToNextStep} disabled={!canProceed}>
              {step === 3 ? 'Gửi yêu cầu' : 'Tiếp theo'}
              {step < 3 && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
