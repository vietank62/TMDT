// Core domain types for MicroMentor

export enum UserRole {
  USER = 'USER',
  EXPERT = 'EXPERT',
  ADMIN = 'ADMIN',
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  APPROVED_AWAITING_PAYMENT = 'APPROVED_AWAITING_PAYMENT',
  EXPIRED_UNPAID = 'EXPIRED_UNPAID',
  PAID_CONFIRMED = 'PAID_CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED_BY_USER = 'CANCELLED_BY_USER',
  CANCELLED_BY_EXPERT = 'CANCELLED_BY_EXPERT',
  NO_SHOW_USER = 'NO_SHOW_USER',
  NO_SHOW_EXPERT = 'NO_SHOW_EXPERT',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ExpertApplicationStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}

export enum NotificationType {
  BOOKING_ACCEPTED = 'BOOKING_ACCEPTED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  SESSION_REMINDER = 'SESSION_REMINDER',
  REFUND_SUCCESS = 'REFUND_SUCCESS',
  NEW_REVIEW = 'NEW_REVIEW',
  APPLICATION_APPROVED = 'APPLICATION_APPROVED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  PROFILE_UPDATE_APPROVED = 'PROFILE_UPDATE_APPROVED',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
}

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl: string
  roles: UserRole[]
  phone?: string
  createdAt: string
  isActive: boolean
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: number
  url?: string
}

export interface ExpertProfile {
  id: string
  userId: string
  slug: string
  displayName: string
  title: string
  company: string
  bio: string
  skills: string[]
  yearsOfExperience: number
  pricePerSession: number
  sessionDurationMinutes: number
  rating: number
  reviewCount: number
  totalSessions: number
  linkedinUrl: string
  portfolioUrl?: string
  certifications: Certification[]
  languages: string[]
  category: string
  isAvailable: boolean
  profilePictureUrl: string
  profileStatus: ExpertApplicationStatus
  totalEarnings: number
  pendingBalance: number
}

export interface AvailabilitySlot {
  id: string
  expertId: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface BookingDocument {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export interface Booking {
  id: string
  userId: string
  expertId: string
  slotIds: string[]
  status: BookingStatus
  problemDescription: string
  sessionGoals: string
  documents: BookingDocument[]
  scheduledAt: string
  durationMinutes: number
  priceVnd: number
  paymentDeadline?: string
  createdAt: string
  updatedAt: string
  rejectionReason?: string
  expertNote?: string
}

export interface Payment {
  id: string
  bookingId: string
  userId: string
  expertId: string
  amount: number
  status: PaymentStatus
  sepayQrCode?: string
  bankAccount?: string
  transferCode?: string
  paidAt?: string
  expiresAt?: string
  createdAt: string
}

export interface PaymentCheck {
  success: boolean
  paid: boolean
  status: PaymentStatus
}

export interface Refund {
  id: string
  bookingId: string
  paymentId: string
  userId: string
  amount: number
  reason: string
  status: RefundStatus
  requestedAt: string
  processedAt?: string
  adminNote?: string
}

export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  expertId: string
  rating: number
  comment: string
  createdAt: string
  isPublic: boolean
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  relatedBookingId?: string
}

export interface Payout {
  id: string
  expertId: string
  amount: number
  status: 'PENDING' | 'PROCESSED'
  requestedAt: string
  processedAt?: string
  bankAccount: string
}

export interface ExpertApplication {
  id: string
  userId: string
  applicantName: string
  applicantEmail: string
  applicantAvatar: string
  title: string
  company: string
  yearsOfExperience: number
  skills: string[]
  bio: string
  category: string
  pricePerSession: number
  linkedinUrl: string
  portfolioUrl?: string
  certifications: Certification[]
  status: ExpertApplicationStatus
  submittedAt: string
  reviewedAt?: string
  adminNote?: string
}

export interface SessionToken {
  appId: string
  channel: string
  token: string
  uid: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  sessions: number
}

export interface BookingStatusCount {
  status: string
  label: string
  count: number
}
