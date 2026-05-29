'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReviewCard from '@/components/common/ReviewCard'
import { AdminReview, api } from '@/lib/api'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.reviews()
      .then((data) => {
        if (mounted) setReviews(data)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <Badge variant="secondary">{loading ? 'Đang tải...' : `${reviews.length} đánh giá`}</Badge>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-500">{error}</CardContent>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-400">{loading ? 'Đang tải...' : 'Không có đánh giá nào'}</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <span>Chuyên gia: <span className="font-medium text-gray-700">{review.expertName}</span></span>
                  <span>·</span>
                  <span>Người đánh giá: <span className="font-medium text-gray-700">{review.reviewerName}</span></span>
                  <span>·</span>
                  <span>Booking: {review.bookingId}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <ReviewCard review={review} reviewerName={review.reviewerName} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
