'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReviewCard from '@/components/common/ReviewCard'
import EmptyState from '@/components/common/EmptyState'
import { Review } from '@/types'
import { api } from '@/lib/api'

export default function ExpertReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadReviews() {
      try {
        const profile = await api.experts.profile()
        const data = await api.experts.reviews(profile.id)
        if (mounted) {
          setReviews(data)
          setRating(profile.rating)
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Không thể tải đánh giá')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadReviews()
    return () => {
      mounted = false
    }
  }, [])

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((review) => review.rating === star).length,
    percent: reviews.length > 0 ? (reviews.filter((review) => review.rating === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đánh giá từ khách hàng</h1>
        <p className="text-gray-500 text-sm mt-1">{loading ? 'Đang tải...' : `${reviews.length} đánh giá`}</p>
      </div>

      {error ? (
        <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="flex gap-8 items-start">
                <div className="text-center">
                  <p className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400">{reviews.length} đánh giá</p>
                </div>
                <div className="flex-1 space-y-2">
                  {distribution.map((item) => (
                    <div key={item.star} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-right text-gray-500">{item.star}</span>
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className="w-6 text-xs text-gray-400 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Tất cả đánh giá</CardTitle></CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <EmptyState icon={Star} title={loading ? 'Đang tải...' : 'Chưa có đánh giá'} description="Các đánh giá từ khách hàng sẽ xuất hiện ở đây" />
              ) : (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
