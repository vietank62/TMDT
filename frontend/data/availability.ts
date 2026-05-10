import { AvailabilitySlot } from '@/types'

const today = new Date()
const addDays = (d: number) => {
  const date = new Date(today)
  date.setDate(today.getDate() + d)
  return date.toISOString().split('T')[0]
}

// All slots are exactly 15 minutes long (startTime + 15 min = endTime).
// Consecutive slots share a boundary: slot[n].endTime === slot[n+1].startTime.
export const mockAvailabilitySlots: AvailabilitySlot[] = [
  // Expert 1 — 3 consecutive 15-min slots on day+1 (09:00–09:45),
  //            1 isolated slot on day+1 afternoon, and scattered singles
  { id: 'slot-1',  expertId: 'expert-1', date: addDays(1), startTime: '09:00', endTime: '09:15', isBooked: false },
  { id: 'slot-1b', expertId: 'expert-1', date: addDays(1), startTime: '09:15', endTime: '09:30', isBooked: false },
  { id: 'slot-1c', expertId: 'expert-1', date: addDays(1), startTime: '09:30', endTime: '09:45', isBooked: false },
  { id: 'slot-2',  expertId: 'expert-1', date: addDays(1), startTime: '14:00', endTime: '14:15', isBooked: false },
  { id: 'slot-3',  expertId: 'expert-1', date: addDays(2), startTime: '10:00', endTime: '10:15', isBooked: true  },
  { id: 'slot-4',  expertId: 'expert-1', date: addDays(3), startTime: '09:00', endTime: '09:15', isBooked: false },
  { id: 'slot-5',  expertId: 'expert-1', date: addDays(4), startTime: '15:00', endTime: '15:15', isBooked: false },
  { id: 'slot-6',  expertId: 'expert-1', date: addDays(5), startTime: '08:00', endTime: '08:15', isBooked: false },
  { id: 'slot-7',  expertId: 'expert-1', date: addDays(7), startTime: '10:00', endTime: '10:15', isBooked: false },

  // Expert 2 — 2 consecutive on day+1 (10:00–10:30), a booked slot on day+2,
  //            2 consecutive on day+3 (14:00–14:30), 1 isolated on day+5
  { id: 'slot-8',   expertId: 'expert-2', date: addDays(1), startTime: '10:00', endTime: '10:15', isBooked: false },
  { id: 'slot-8b',  expertId: 'expert-2', date: addDays(1), startTime: '10:15', endTime: '10:30', isBooked: false },
  { id: 'slot-9',   expertId: 'expert-2', date: addDays(2), startTime: '14:00', endTime: '14:15', isBooked: true  },
  { id: 'slot-10',  expertId: 'expert-2', date: addDays(3), startTime: '14:00', endTime: '14:15', isBooked: false },
  { id: 'slot-10b', expertId: 'expert-2', date: addDays(3), startTime: '14:15', endTime: '14:30', isBooked: false },
  { id: 'slot-11',  expertId: 'expert-2', date: addDays(5), startTime: '09:00', endTime: '09:15', isBooked: false },

  // Expert 3 — all isolated slots, no consecutive pairs (contrast case)
  { id: 'slot-12', expertId: 'expert-3', date: addDays(1), startTime: '11:00', endTime: '11:15', isBooked: false },
  { id: 'slot-13', expertId: 'expert-3', date: addDays(2), startTime: '15:00', endTime: '15:15', isBooked: false },
  { id: 'slot-14', expertId: 'expert-3', date: addDays(4), startTime: '10:00', endTime: '10:15', isBooked: false },

  // Expert 5 — 4 consecutive 15-min slots on day+1 (09:00–10:00), max 60 min total
  { id: 'slot-15',  expertId: 'expert-5', date: addDays(1), startTime: '09:00', endTime: '09:15', isBooked: false },
  { id: 'slot-15b', expertId: 'expert-5', date: addDays(1), startTime: '09:15', endTime: '09:30', isBooked: false },
  { id: 'slot-15c', expertId: 'expert-5', date: addDays(1), startTime: '09:30', endTime: '09:45', isBooked: false },
  { id: 'slot-15d', expertId: 'expert-5', date: addDays(1), startTime: '09:45', endTime: '10:00', isBooked: false },
  { id: 'slot-16',  expertId: 'expert-5', date: addDays(2), startTime: '11:00', endTime: '11:15', isBooked: false },
  { id: 'slot-17',  expertId: 'expert-5', date: addDays(3), startTime: '14:00', endTime: '14:15', isBooked: false },
  { id: 'slot-18',  expertId: 'expert-5', date: addDays(6), startTime: '10:00', endTime: '10:15', isBooked: false },

  // Expert 6 — booked slot then free consecutive on day+1 (13:00–13:30),
  //            2 consecutive on day+2 (09:00–09:30), singles on day+3 and day+4
  { id: 'slot-19',  expertId: 'expert-6', date: addDays(1), startTime: '13:00', endTime: '13:15', isBooked: true  },
  { id: 'slot-19b', expertId: 'expert-6', date: addDays(1), startTime: '13:15', endTime: '13:30', isBooked: false },
  { id: 'slot-20',  expertId: 'expert-6', date: addDays(2), startTime: '09:00', endTime: '09:15', isBooked: false },
  { id: 'slot-20b', expertId: 'expert-6', date: addDays(2), startTime: '09:15', endTime: '09:30', isBooked: false },
  { id: 'slot-21',  expertId: 'expert-6', date: addDays(3), startTime: '15:00', endTime: '15:15', isBooked: false },
  { id: 'slot-22',  expertId: 'expert-6', date: addDays(4), startTime: '11:00', endTime: '11:15', isBooked: false },
]

export function getSlotsByExpertId(expertId: string): AvailabilitySlot[] {
  return mockAvailabilitySlots.filter((s) => s.expertId === expertId)
}

export function getAvailableSlotsByExpertId(expertId: string): AvailabilitySlot[] {
  return mockAvailabilitySlots.filter((s) => s.expertId === expertId && !s.isBooked)
}
