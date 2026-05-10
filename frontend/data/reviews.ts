import { Review } from '@/types'

const pastDate = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    bookingId: 'booking-2',
    reviewerId: 'user-1',
    expertId: 'expert-2',
    rating: 5,
    comment: 'Chị Linh tư vấn rất chi tiết và thực tế. Tôi đã có được lộ trình marketing rõ ràng sau buổi tư vấn. Chị có kinh nghiệm dày dạn và chia sẻ rất nhiều case study thực tế. Rất đáng tiền!',
    createdAt: pastDate(7),
    isPublic: true,
  },
  {
    id: 'review-2',
    bookingId: 'booking-6',
    reviewerId: 'user-3',
    expertId: 'expert-4',
    rating: 5,
    comment: 'Chị Thu cho feedback rất cụ thể và xây dựng về portfolio của tôi. Nhờ đó tôi đã improve được nhiều case study và cuối cùng nhận được offer từ Grab. Cảm ơn chị rất nhiều!',
    createdAt: pastDate(14),
    isPublic: true,
  },
  {
    id: 'review-3',
    bookingId: 'booking-7',
    reviewerId: 'user-1',
    expertId: 'expert-5',
    rating: 4,
    comment: 'Anh An có nhiều kinh nghiệm thực chiến về startup và chia sẻ rất thẳng thắn. Buổi tư vấn giúp tôi định hình được rõ hơn về go-to-market strategy. Sẽ đặt thêm buổi tiếp theo.',
    createdAt: pastDate(5),
    isPublic: true,
  },
  {
    id: 'review-4',
    bookingId: 'booking-1',
    reviewerId: 'user-2',
    expertId: 'expert-1',
    rating: 5,
    comment: 'Anh Đức giải thích rất rõ ràng về event-driven architecture. Tôi đã hiểu được sự khác biệt giữa Kafka và RabbitMQ và quyết định được công nghệ phù hợp cho dự án. Highly recommend!',
    createdAt: pastDate(15),
    isPublic: true,
  },
  {
    id: 'review-5',
    bookingId: 'booking-3',
    reviewerId: 'user-3',
    expertId: 'expert-6',
    rating: 5,
    comment: 'Anh Đức HR tư vấn career coaching xuất sắc. Anh giúp tôi hiểu rõ hơn về career path PM và cách chuẩn bị. CV của tôi sau khi được review đã tốt hơn nhiều.',
    createdAt: pastDate(30),
    isPublic: true,
  },
  {
    id: 'review-6',
    bookingId: 'booking-4',
    reviewerId: 'user-2',
    expertId: 'expert-1',
    rating: 4,
    comment: 'Buổi tư vấn về system design rất hữu ích. Anh Đức đưa ra nhiều insights hay về scalability và performance. Tuy nhiên thời gian hơi ngắn so với lượng kiến thức cần trao đổi.',
    createdAt: pastDate(20),
    isPublic: true,
  },
  {
    id: 'review-7',
    bookingId: 'booking-9',
    reviewerId: 'user-1',
    expertId: 'expert-3',
    rating: 5,
    comment: 'Anh Bảo có kiến thức chuyên sâu về tài chính doanh nghiệp. Buổi tư vấn về fundraising giúp tôi hiểu rõ quy trình và chuẩn bị pitch deck tốt hơn.',
    createdAt: pastDate(45),
    isPublic: true,
  },
  {
    id: 'review-8',
    bookingId: 'booking-5',
    reviewerId: 'user-3',
    expertId: 'expert-7',
    rating: 4,
    comment: 'Anh Long tư vấn rất chuyên nghiệp về chiến lược kinh doanh quốc tế. Học được nhiều về cách tiếp cận thị trường mới.',
    createdAt: pastDate(55),
    isPublic: true,
  },
]

export function getReviewsByExpertId(expertId: string): Review[] {
  return mockReviews.filter((r) => r.expertId === expertId && r.isPublic)
}

export function getAverageRating(expertId: string): number {
  const reviews = getReviewsByExpertId(expertId)
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}
