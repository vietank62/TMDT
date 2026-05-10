'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { use, useState } from 'react'
import { ArrowLeft, Award, ExternalLink, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { getApplicationById } from '@/data/applications'
import { ExpertApplicationStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EXPERT_CATEGORIES } from '@/constants'

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const app = getApplicationById(id)
  if (!app) notFound()

  const [status, setStatus] = useState(app.status)
  const [dialog, setDialog] = useState<{ open: boolean; type: 'approve' | 'reject' | 'revision' }>({ open: false, type: 'approve' })
  const [note, setNote] = useState('')

  const categoryLabel = EXPERT_CATEGORIES.find((c) => c.value === app.category)?.label ?? app.category
  const isPending = status === ExpertApplicationStatus.PENDING_REVIEW

  function handleAction(type: 'approve' | 'reject' | 'revision') {
    setNote('')
    setDialog({ open: true, type })
  }

  function confirm() {
    if (dialog.type === 'approve') setStatus(ExpertApplicationStatus.APPROVED)
    if (dialog.type === 'reject') setStatus(ExpertApplicationStatus.REJECTED)
    if (dialog.type === 'revision') setStatus(ExpertApplicationStatus.NEEDS_REVISION)
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/applications"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ</h1>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={app.applicantAvatar} />
              <AvatarFallback>{app.applicantName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-bold text-gray-900">{app.applicantName}</p>
                  <p className="text-gray-500">{app.title} · {app.company}</p>
                  <p className="text-sm text-gray-400">{app.applicantEmail}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">{categoryLabel}</Badge>
                <Badge variant="secondary">{app.yearsOfExperience} năm KN</Badge>
                <Badge variant="secondary">{formatCurrency(app.pricePerSession)}/buổi</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader><CardTitle className="text-base">Giới thiệu bản thân</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{app.bio}</p></CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle className="text-base">Kỹ năng</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {app.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {app.certifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Chứng chỉ</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {app.certifications.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-lg border p-3">
                <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.issuer} · {c.year}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader><CardTitle className="text-base">Liên kết</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href={app.linkedinUrl} className="flex items-center gap-2 text-sm text-blue-600 hover:underline" target="_blank">
            <Globe className="h-4 w-4" />LinkedIn: {app.linkedinUrl}
          </a>
          {app.portfolioUrl && (
            <a href={app.portfolioUrl} className="flex items-center gap-2 text-sm text-blue-600 hover:underline" target="_blank">
              <ExternalLink className="h-4 w-4" />Portfolio: {app.portfolioUrl}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardContent className="p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Ngày nộp</span><span>{formatDate(app.submittedAt)}</span></div>
          {app.reviewedAt && <div className="flex justify-between"><span className="text-gray-500">Ngày xét duyệt</span><span>{formatDate(app.reviewedAt)}</span></div>}
          {app.adminNote && <div className="mt-2 rounded-lg bg-gray-50 p-3"><p className="text-xs font-medium text-gray-600 mb-1">Ghi chú admin</p><p className="text-xs text-gray-500">{app.adminNote}</p></div>}
        </CardContent>
      </Card>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-3">
          <Button onClick={() => handleAction('approve')} className="flex-1">Phê duyệt</Button>
          <Button variant="destructive" onClick={() => handleAction('reject')} className="flex-1">Từ chối</Button>
          <Button variant="outline" onClick={() => handleAction('revision')} className="flex-1">Yêu cầu bổ sung</Button>
        </div>
      )}

      <ConfirmDialog
        open={dialog.open}
        onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))}
        title={dialog.type === 'approve' ? 'Phê duyệt hồ sơ' : dialog.type === 'reject' ? 'Từ chối hồ sơ' : 'Yêu cầu bổ sung'}
        confirmLabel={dialog.type === 'approve' ? 'Phê duyệt' : dialog.type === 'reject' ? 'Từ chối' : 'Gửi yêu cầu'}
        variant={dialog.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={confirm}
      >
        <div>
          <Label>Ghi chú cho ứng viên</Label>
          <Textarea className="mt-1" placeholder="Nhập ghi chú..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </div>
      </ConfirmDialog>
    </div>
  )
}
