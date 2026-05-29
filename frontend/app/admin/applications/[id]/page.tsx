'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { ArrowLeft, Award, ExternalLink, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import StatusBadge from '@/components/common/StatusBadge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { ExpertApplication, ExpertApplicationStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { EXPERT_CATEGORIES } from '@/constants'
import { api } from '@/lib/api'

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [app, setApp] = useState<ExpertApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ open: boolean; type: 'approve' | 'reject' | 'revision' }>({ open: false, type: 'approve' })
  const [note, setNote] = useState('')

  useEffect(() => {
    let mounted = true
    api.admin.application(id)
      .then((data) => {
        if (mounted) setApp(data)
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
  }, [id])

  async function confirm() {
    if (!app) return
    const updated =
      dialog.type === 'approve'
        ? await api.admin.approveApplication(app.id, note)
        : dialog.type === 'reject'
          ? await api.admin.rejectApplication(app.id, note)
          : await api.admin.rejectApplication(app.id, note)
    setApp(updated)
  }

  if (loading) return <div className="text-sm text-gray-400">Đang tải...</div>
  if (error || !app) return <div className="rounded-lg border bg-white p-6 text-sm text-red-500">{error || 'Không tìm thấy hồ sơ'}</div>

  const categoryLabel = EXPERT_CATEGORIES.find((c) => c.value === app.category)?.label ?? app.category
  const isPending = app.status === ExpertApplicationStatus.PENDING_REVIEW

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/applications"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-xl font-bold text-gray-900">Chi tiết hồ sơ</h1>
      </div>

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
                <StatusBadge status={app.status} />
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

      <Card><CardHeader><CardTitle className="text-base">Giới thiệu bản thân</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{app.bio}</p></CardContent></Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Kỹ năng</CardTitle></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2">{app.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></CardContent>
      </Card>

      {app.certifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Chứng chỉ</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {app.certifications.map((cert) => (
              <div key={cert.id} className="flex items-start gap-3 rounded-lg border p-3">
                <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div><p className="font-medium text-sm">{cert.name}</p><p className="text-xs text-gray-500">{cert.issuer} · {cert.year}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Liên kết</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {app.linkedinUrl && <a href={app.linkedinUrl} className="flex items-center gap-2 text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer"><Globe className="h-4 w-4" />LinkedIn: {app.linkedinUrl}</a>}
          {app.portfolioUrl && <a href={app.portfolioUrl} className="flex items-center gap-2 text-sm text-blue-600 hover:underline" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Portfolio: {app.portfolioUrl}</a>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Ngày nộp</span><span>{formatDate(app.submittedAt)}</span></div>
          {app.reviewedAt && <div className="flex justify-between"><span className="text-gray-500">Ngày xét duyệt</span><span>{formatDate(app.reviewedAt)}</span></div>}
          {app.adminNote && <div className="mt-2 rounded-lg bg-gray-50 p-3"><p className="text-xs font-medium text-gray-600 mb-1">Ghi chú admin</p><p className="text-xs text-gray-500">{app.adminNote}</p></div>}
        </CardContent>
      </Card>

      {isPending && (
        <div className="flex gap-3">
          <Button onClick={() => { setNote(''); setDialog({ open: true, type: 'approve' }) }} className="flex-1">Phê duyệt</Button>
          <Button variant="destructive" onClick={() => { setNote(''); setDialog({ open: true, type: 'reject' }) }} className="flex-1">Từ chối</Button>
        </div>
      )}

      <ConfirmDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        title={dialog.type === 'approve' ? 'Phê duyệt hồ sơ' : 'Từ chối hồ sơ'}
        confirmLabel={dialog.type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        variant={dialog.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={confirm}
      >
        <div>
          <Label>Ghi chú cho ứng viên</Label>
          <Textarea className="mt-1" placeholder="Nhập ghi chú..." value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        </div>
      </ConfirmDialog>
    </div>
  )
}
