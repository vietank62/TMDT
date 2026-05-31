'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExpertProfile } from '@/types'
import { api } from '@/lib/api'

export default function ExpertProfilePage() {
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    let mounted = true
    api.experts.profile()
      .then((data) => {
        if (mounted) {
          setExpert(data)
          setSkills(data.skills)
        }
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

  async function save(formData: FormData) {
    if (!expert) return
    const str = (key: string) => String(formData.get(key) ?? '').trim()
    const nullableStr = (key: string) => str(key) || null
    const updated = await api.experts.updateProfile({
      display_name: str('displayName'),
      title: str('title'),
      company: nullableStr('company'),
      years_of_experience: Number(formData.get('yearsOfExperience') ?? 0),
      price_per_session: Number(formData.get('pricePerSession') ?? 0),
      bio: str('bio'),
      skills,
      linkedin_url: nullableStr('linkedinUrl'),
      portfolio_url: nullableStr('portfolioUrl'),
    })
    setExpert(updated)
    setSkills(updated.skills)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addSkill() {
    const next = skillInput.trim()
    if (!next) return
    setSkills((prev) => [...prev, next])
    setSkillInput('')
  }

  if (loading) return <div className="text-sm text-gray-400">Đang tải...</div>
  if (error || !expert) return <div className="rounded-lg border bg-white p-6 text-sm text-red-500">{error || 'Không tìm thấy hồ sơ chuyên gia'}</div>

  return (
    <form action={save} className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hồ sơ chuyên gia</h1>
          <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin công khai trên trang hồ sơ của bạn</p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">{expert.profileStatus}</div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={expert.profilePictureUrl} />
              <AvatarFallback className="text-xl">{expert.displayName[0]}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" type="button">Thay đổi ảnh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên hiển thị</Label>
              <Input name="displayName" className="mt-1" defaultValue={expert.displayName} />
            </div>
            <div>
              <Label>Chức danh</Label>
              <Input name="title" className="mt-1" defaultValue={expert.title} />
            </div>
          </div>
          <div>
            <Label>Công ty</Label>
            <Input name="company" className="mt-1" defaultValue={expert.company} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số năm kinh nghiệm</Label>
              <Input name="yearsOfExperience" type="number" className="mt-1" defaultValue={expert.yearsOfExperience} />
            </div>
            <div>
              <Label>Giá mỗi buổi (VNĐ)</Label>
              <Input name="pricePerSession" type="number" className="mt-1" defaultValue={expert.pricePerSession} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <Textarea name="bio" rows={5} defaultValue={expert.bio} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Kỹ năng</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Thêm kỹ năng..."
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addSkill()
                }
              }}
            />
            <Button variant="outline" type="button" onClick={addSkill}>Thêm</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => setSkills(skills.filter((item) => item !== skill))}>
                {skill} x
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Liên kết</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>LinkedIn URL</Label>
            <Input name="linkedinUrl" className="mt-1" defaultValue={expert.linkedinUrl} />
          </div>
          <div>
            <Label>Portfolio URL</Label>
            <Input name="portfolioUrl" className="mt-1" defaultValue={expert.portfolioUrl ?? ''} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit"><Save className="h-4 w-4 mr-2" />{saved ? 'Đã lưu!' : 'Lưu thay đổi'}</Button>
        <p className="text-xs text-gray-400">Thay đổi có thể cần admin duyệt trước khi hiển thị công khai.</p>
      </div>
    </form>
  )
}
