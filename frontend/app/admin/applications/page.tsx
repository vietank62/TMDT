'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, FileText } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatusBadge from '@/components/common/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { ExpertApplication, ExpertApplicationStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { EXPERT_CATEGORIES } from '@/constants'
import { api } from '@/lib/api'

function AppCard({ app }: { app: ExpertApplication }) {
  const categoryLabel = EXPERT_CATEGORIES.find((c) => c.value === app.category)?.label ?? app.category
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={app.applicantAvatar} />
            <AvatarFallback>{app.applicantName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-gray-900">{app.applicantName}</p>
                <p className="text-sm text-gray-500">{app.title} · {app.company}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">{categoryLabel}</Badge>
              <span className="text-xs text-gray-400">{app.yearsOfExperience} năm KN</span>
              <span className="text-xs text-gray-400">Nộp: {formatDate(app.submittedAt)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{app.bio}</p>
            {app.adminNote && (
              <p className="text-xs text-gray-400 italic mt-1 bg-gray-50 rounded p-2">{app.adminNote}</p>
            )}
            <div className="mt-3">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/applications/${app.id}`}><Eye className="h-4 w-4 mr-1" />Xem chi tiết</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ExpertApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.applications()
      .then((data) => {
        if (mounted) setApplications(data)
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

  const pending = applications.filter((app) => app.status === ExpertApplicationStatus.PENDING_REVIEW)
  const reviewed = applications.filter((app) => app.status !== ExpertApplicationStatus.PENDING_REVIEW)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Hồ sơ chờ duyệt</h1>
        {pending.length > 0 && <Badge className="bg-orange-500">{pending.length} chờ duyệt</Badge>}
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-500">{error}</CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Chờ duyệt ({pending.length})</TabsTrigger>
            <TabsTrigger value="reviewed">Đã xử lý ({reviewed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4 space-y-3">
            {pending.length === 0 ? <EmptyState icon={FileText} title={loading ? 'Đang tải...' : 'Không có hồ sơ nào chờ duyệt'} /> : pending.map((app) => <AppCard key={app.id} app={app} />)}
          </TabsContent>
          <TabsContent value="reviewed" className="mt-4 space-y-3">
            {reviewed.length === 0 ? <EmptyState icon={FileText} title={loading ? 'Đang tải...' : 'Chưa có hồ sơ đã xử lý'} /> : reviewed.map((app) => <AppCard key={app.id} app={app} />)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
