import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExpertProfile } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { EXPERT_CATEGORIES } from '@/constants'

interface ExpertCardProps {
  expert: ExpertProfile
  compact?: boolean
}

export default function ExpertCard({ expert, compact }: ExpertCardProps) {
  const categoryLabel = EXPERT_CATEGORIES.find((c) => c.value === expert.category)?.label ?? expert.category

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Link href={`/experts/${expert.slug}`} className="shrink-0">
            <Avatar className="h-14 w-14 ring-2 ring-offset-1 ring-blue-100">
              <AvatarImage src={expert.profilePictureUrl} alt={expert.displayName} />
              <AvatarFallback className="text-lg">{expert.displayName[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/experts/${expert.slug}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {expert.displayName}
                </Link>
                <p className="text-sm text-gray-500 truncate">{expert.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{expert.company}</span>
                </div>
              </div>
              {!expert.isAvailable && (
                <Badge variant="secondary" className="shrink-0 text-xs">Không rảnh</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{expert.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({expert.reviewCount})</span>
              </div>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{expert.totalSessions} phiên</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{expert.yearsOfExperience} năm KN</span>
            </div>

            {!compact && (
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline" className="text-xs">{categoryLabel}</Badge>
                {expert.skills.slice(0, 2).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
                {expert.skills.length > 2 && (
                  <Badge variant="secondary" className="text-xs">+{expert.skills.length - 2}</Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {!compact && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{expert.bio}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-blue-600">{formatCurrency(expert.pricePerSession)}</span>
            <span className="text-xs text-gray-500">/{expert.sessionDurationMinutes} phút</span>
          </div>
          <Button size="sm" asChild disabled={!expert.isAvailable}>
            <Link href={`/booking/${expert.slug}`}>
              {expert.isAvailable ? 'Đặt lịch' : 'Không rảnh'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
