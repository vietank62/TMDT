'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns/format'
import { addDays } from 'date-fns/addDays'
import { vi } from 'date-fns/locale/vi'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AvailabilitySlot } from '@/types'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [savingTime, setSavingTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.experts.myAvailability()
      .then((data) => {
        if (mounted) setSlots(data)
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const slotsForDate = slots.filter((slot) => slot.date === dateStr)
  const bookedSlots = slotsForDate.filter((slot) => slot.isBooked)
  const freeSlots = slotsForDate.filter((slot) => !slot.isBooked)

  async function toggleSlot(time: string) {
    if (!dateStr) return
    const existing = slots.find((slot) => slot.date === dateStr && slot.startTime === time)
    if (existing?.isBooked) return

    setSavingTime(time)
    try {
      if (existing) {
        await api.experts.deleteAvailability(existing.id)
        setSlots((prev) => prev.filter((slot) => slot.id !== existing.id))
      } else {
        const created = await api.experts.createAvailability({ date: dateStr, start_time: time })
        setSlots((prev) => [...prev, created])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật lịch rảnh')
    } finally {
      setSavingTime('')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản lý lịch rảnh</h1>
        <p className="text-gray-500 text-sm mt-1">Chọn ngày và thêm/xóa các khung giờ bạn có thể tư vấn</p>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Chọn ngày</CardTitle></CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={vi}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              className="w-fit"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-gray-400">Chọn ngày để quản lý khung giờ</p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">{loading ? 'Đang tải...' : 'Nhấn để thêm/xóa khung giờ. Khung giờ đã đặt không thể xóa.'}</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const slot = slots.find((item) => item.date === dateStr && item.startTime === time)
                    const isBooked = slot?.isBooked
                    const isSelected = !!slot && !isBooked
                    return (
                      <button
                        key={time}
                        onClick={() => toggleSlot(time)}
                        disabled={!!isBooked || savingTime === time}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          isBooked ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' :
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' :
                          'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50',
                        )}
                      >
                        {savingTime === time ? '...' : time}
                        {isBooked && <span className="block text-xs">Đã đặt</span>}
                      </button>
                    )
                  })}
                </div>

                {freeSlots.length > 0 && (
                  <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs font-medium text-green-700">{freeSlots.length} khung giờ trống được thiết lập</p>
                  </div>
                )}
                {bookedSlots.length > 0 && (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                    <p className="text-xs font-medium text-orange-700">{bookedSlots.length} khung giờ đã được đặt</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Button disabled>Lịch được lưu tự động</Button>
    </div>
  )
}
