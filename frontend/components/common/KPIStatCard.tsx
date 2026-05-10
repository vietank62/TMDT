import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KPIStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  iconColor?: string
  iconBg?: string
  description?: string
}

export default function KPIStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  description,
}: KPIStatCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="mt-0.5 text-xs text-gray-400">{description}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn('text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
                  {Math.abs(trend)}%
                </span>
                {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3', iconBg)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
