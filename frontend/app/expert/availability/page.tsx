'use client'

import { useState } from 'react'
import { format } from 'date-fns/format'
import { addDays } from 'date-fns/addDays'
import { vi } from 'date-fns/locale/vi'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvailabilitySlot } from '@/types'
import { getSlotsByExpertId } from '@/data/availability'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

const TIME_SLOTS = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

export default function AvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [slots, setSlots] = useState<AvailabilitySlot[]>(getSlotsByExpertId('expert-1'))
  const [saved, setSaved] = useState(false)

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const slotsForDate = slots.filter((s) => s.date === dateStr)
  const bookedSlots = slotsForDate.filter((s) => s.isBooked)
  const freeSlots = slotsForDate.filter((s) => !s.isBooked)

  function toggleSlot(time: string) {
    const existing = slots.find((s) => s.date === dateStr && s.startTime === time)
    if (existing) {
      if (existing.isBooked) return // can't remove booked slots
      setSlots(slots.filter((s) => s.id !== existing.id))
    } else {
      const [h] = time.split(':').map(Number)
      setSlots([...slots, {
        id: `slot-new-${Date.now()}`,
        expertId: 'expert-1',
        date: dateStr,
        startTime: time,
        endTime: `${String(h + 1).padStart(2, '0')}:00`,
        isBooked: false,
      }])
    }
  }

  async function saveAvailability() {
    await new Promise((r) => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản lý lịch rảnh</h1>
        <p className="text-gray-500 text-sm mt-1">Chọn ngày và thêm/xóa các khung giờ bạn có thể tư vấn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader><CardTitle className="text-base">Chọn ngày</CardTitle></CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={vi}
              disabled={(d) => {
                const today = new Date(); today.setHours(0, 0, 0, 0)
                return d < today
              }}
              className="w-fit"
            />
          </CardContent>
        </Card>

        {/* Time slots */}
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
                <p className="text-xs text-gray-500">Nhấn để thêm/xóa khung giờ. Khung giờ đã đặt không thể xóa.</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const slot = slots.find((s) => s.date === dateStr && s.startTime === time)
                    const isBooked = slot?.isBooked
                    const isSelected = !!slot && !isBooked
                    return (
                      <button
                        key={time}
                        onClick={() => toggleSlot(time)}
                        disabled={isBooked}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                          isBooked ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' :
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' :
                          'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        )}
                      >
                        {time}
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

      <Button onClick={saveAvailability}>
        {saved ? '✓ Đã lưu lịch!' : 'Lưu lịch rảnh'}
      </Button>
    </div>
  )
}
