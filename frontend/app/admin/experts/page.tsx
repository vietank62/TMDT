import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DataTable, { Column } from '@/components/common/DataTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockExperts } from '@/data/experts'
import { ExpertProfile } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Star } from 'lucide-react'
import { EXPERT_CATEGORIES } from '@/constants'

const columns: Column<ExpertProfile>[] = [
  {
    key: 'displayName',
    label: 'Chuyên gia',
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.profilePictureUrl} />
          <AvatarFallback>{row.displayName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{row.displayName}</p>
          <p className="text-xs text-gray-400">{row.title}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Lĩnh vực',
    render: (v) => <span className="text-sm">{EXPERT_CATEGORIES.find((c) => c.value === v)?.label ?? String(v)}</span>,
  },
  {
    key: 'rating',
    label: 'Đánh giá',
    render: (v) => (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{Number(v).toFixed(1)}</span>
      </div>
    ),
  },
  { key: 'totalSessions', label: 'Phiên', render: (v) => <span className="text-sm">{String(v)}</span> },
  { key: 'pricePerSession', label: 'Giá/buổi', render: (v) => <span className="text-sm">{formatCurrency(Number(v))}</span> },
  {
    key: 'isAvailable',
    label: 'Trạng thái',
    render: (v) => (
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
        {v ? 'Đang hoạt động' : 'Tạm nghỉ'}
      </span>
    ),
  },
]

export default function AdminExpertsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý chuyên gia</h1>
        <Badge variant="secondary">{mockExperts.length} chuyên gia</Badge>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={mockExperts} emptyMessage="Không có chuyên gia nào" />
        </CardContent>
      </Card>
    </div>
  )
}
