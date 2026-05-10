'use client'

import { useState } from 'react'
import { format } from 'date-fns/format'
import { isSameDay } from 'date-fns/isSameDay'
import { parseISO } from 'date-fns/parseISO'
import { vi } from 'date-fns/locale/vi'
import { Calendar } from '@/components/ui/calendar'
import { AvailabilitySlot } from '@/types'
import { cn } from '@/lib/utils'

interface AvailabilityCalendarProps {
  slots: AvailabilitySlot[]
  selectedSlots: AvailabilitySlot[]
  onSelectSlots?: (slots: AvailabilitySlot[]) => void
  mode?: 'select' | 'edit'
}

function isAdjacentToSelection(slot: AvailabilitySlot, selected: AvailabilitySlot[]): boolean {
  if (selected.length === 0) return true
  const sorted = [...selected].sort((a, b) => a.startTime.localeCompare(b.startTime))
  return slot.endTime === sorted.at(0)!.startTime || slot.startTime === sorted.at(-1)!.endTime
}

function computeTotalMinutes(sorted: AvailabilitySlot[]): number {
  const [startH, startM] = sorted.at(0)!.startTime.split(':').map(Number)
  const [endH, endM] = sorted.at(-1)!.endTime.split(':').map(Number)
  return endH * 60 + endM - (startH * 60 + startM)
}

function slotButtonClass(
  isSelected: boolean,
  isAdjacent: boolean,
  hasSelection: boolean,
): string {
  if (isSelected) return 'border-blue-600 bg-blue-600 text-white'
  if (isAdjacent) return 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-300'
  if (hasSelection) return 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-600'
  return 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
}

function slotButtonTitle(
  isSelected: boolean,
  isMiddle: boolean,
  isAdjacent: boolean,
  hasSelection: boolean,
): string {
  if (isSelected && isMiddle) return 'Nhấn để bỏ chọn từ khung này trở đi'
  if (isSelected) return 'Nhấn để bỏ chọn'
  if (isAdjacent) return 'Nhấn để thêm vào phiên liên tiếp'
  if (hasSelection) return 'Không liên tiếp — nhấn để bắt đầu chọn lại từ đây'
  return 'Chọn khung giờ này'
}

export default function AvailabilityCalendar({
  slots,
  selectedSlots,
  onSelectSlots = () => {},
  mode = 'select',
}: Readonly<AvailabilityCalendarProps>) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const availableDates = slots
    .filter((s) => !s.isBooked)
    .map((s) => parseISO(s.date))

  const slotsForSelectedDate = selectedDate
    ? slots
        .filter((s) => !s.isBooked && isSameDay(parseISO(s.date), selectedDate))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : []

  const isDateAvailable = (date: Date) =>
    availableDates.some((d) => isSameDay(d, date))

  const selectedIds = new Set(selectedSlots.map((s) => s.id))
  const sortedSelected = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const totalMinutes = selectedSlots.length > 0 ? computeTotalMinutes(sortedSelected) : 0

  function handleSlotClick(slot: AvailabilitySlot) {
    if (selectedIds.has(slot.id)) {
      // Deselect this slot and everything after it, keeping the head of the sequence.
      const idx = sortedSelected.findIndex((s) => s.id === slot.id)
      onSelectSlots(sortedSelected.slice(0, idx))
      return
    }
    if (isAdjacentToSelection(slot, selectedSlots)) {
      const next = [...selectedSlots, slot].sort((a, b) => a.startTime.localeCompare(b.startTime))
      onSelectSlots(next)
    } else {
      // Not adjacent — replace the whole selection with just this slot.
      onSelectSlots([slot])
    }
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date)
    // Clear slot selection when switching to a different day.
    if (date && selectedSlots.length > 0 && !isSameDay(parseISO(selectedSlots[0].date), date)) {
      onSelectSlots([])
    }
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        locale={vi}
        disabled={(date) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date < today || !isDateAvailable(date)
        }}
        modifiers={{ available: availableDates }}
        modifiersClassNames={{
          available: 'border border-blue-300 bg-blue-50 text-blue-700 font-medium',
        }}
        className="rounded-lg border w-fit"
      />

      {selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              Khung giờ trống — {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </p>
            {selectedSlots.length > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {selectedSlots.length} khung · {totalMinutes} phút
              </span>
            )}
          </div>

          {slotsForSelectedDate.length === 0 ? (
            <p className="text-sm text-gray-400">Không có khung giờ trống cho ngày này.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {slotsForSelectedDate.map((slot) => {
                  const isSelected = selectedIds.has(slot.id)
                  const isAdjacent = !isSelected && isAdjacentToSelection(slot, selectedSlots)
                  const hasSelection = selectedSlots.length > 0
                  const idx = sortedSelected.findIndex((s) => s.id === slot.id)
                  const isMiddle = isSelected && idx > 0 && idx < sortedSelected.length - 1

                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot)}
                      title={slotButtonTitle(isSelected, isMiddle, isAdjacent, hasSelection)}
                      className={cn(
                        'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                        slotButtonClass(isSelected, isAdjacent, hasSelection),
                      )}
                    >
                      {slot.startTime} – {slot.endTime}
                      {!isSelected && isAdjacent && hasSelection && (
                        <span className="ml-1 text-xs opacity-70">＋</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedSlots.length > 0 ? (
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800 space-y-0.5">
                  <p className="font-medium">
                    Đã chọn {selectedSlots.length} khung giờ liên tiếp · {totalMinutes} phút
                  </p>
                  <p className="text-blue-600 text-xs">
                    {sortedSelected.at(0)!.startTime} – {sortedSelected.at(-1)!.endTime}
                    {' '}· Nhấn vào khung đã chọn để bỏ chọn từ khung đó trở đi.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  Nhấn chọn khung giờ đầu tiên, sau đó thêm các khung liền kề để kéo dài phiên.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-gray-400">Chọn một ngày có màu xanh để xem khung giờ trống.</p>
      )}
    </div>
  )
}
