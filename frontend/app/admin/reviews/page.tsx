import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReviewCard from '@/components/common/ReviewCard'
import { mockReviews } from '@/data/reviews'
import { getExpertById } from '@/data/experts'
import { Star } from 'lucide-react'

export default function AdminReviewsPage() {
  const publicReviews = mockReviews.filter((r) => r.isPublic)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <Badge variant="secondary">{publicReviews.length} đánh giá</Badge>
      </div>

      <div className="space-y-3">
        {publicReviews.map((review) => {
          const expert = getExpertById(review.expertId)
          return (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <span>Chuyên gia: <span className="font-medium text-gray-700">{expert?.displayName}</span></span>
                  <span>·</span>
                  <span>Booking: {review.bookingId}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <ReviewCard review={review} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
