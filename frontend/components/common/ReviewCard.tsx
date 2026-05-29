import { Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Review } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReviewCardProps {
  review: Review
  reviewerName?: string
}

export default function ReviewCard({ review, reviewerName = 'Ẩn danh' }: ReviewCardProps) {
  return (
    <div className="flex gap-3 py-4 border-b last:border-0">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src="" />
        <AvatarFallback>{reviewerName[0] ?? '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm text-gray-900">{reviewerName}</p>
          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  )
}
