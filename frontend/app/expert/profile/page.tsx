'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getExpertById } from '@/data/experts'

const expert = getExpertById('expert-1')!

export default function ExpertProfilePage() {
  const [saved, setSaved] = useState(false)
  const [skills, setSkills] = useState(expert.skills)
  const [skillInput, setSkillInput] = useState('')

  async function save() {
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hồ sơ chuyên gia</h1>
          <p className="text-gray-500 text-sm mt-1">Cập nhật thông tin công khai trên trang hồ sơ của bạn</p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Đã được duyệt</div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={expert.profilePictureUrl} />
              <AvatarFallback className="text-xl">{expert.displayName[0]}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Thay đổi ảnh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tên hiển thị</Label>
              <Input className="mt-1" defaultValue={expert.displayName} />
            </div>
            <div>
              <Label>Chức danh</Label>
              <Input className="mt-1" defaultValue={expert.title} />
            </div>
          </div>
          <div>
            <Label>Công ty</Label>
            <Input className="mt-1" defaultValue={expert.company} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số năm kinh nghiệm</Label>
              <Input type="number" className="mt-1" defaultValue={expert.yearsOfExperience} />
            </div>
            <div>
              <Label>Giá mỗi buổi (VNĐ)</Label>
              <Input type="number" className="mt-1" defaultValue={expert.pricePerSession} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={5} defaultValue={expert.bio} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Kỹ năng</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Thêm kỹ năng..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput('') } }
              }}
            />
            <Button variant="outline" onClick={() => { if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput('') } }}>Thêm</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                {s} ×
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
            <Input className="mt-1" defaultValue={expert.linkedinUrl} />
          </div>
          <div>
            <Label>Portfolio URL</Label>
            <Input className="mt-1" defaultValue={expert.portfolioUrl ?? ''} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save}><Save className="h-4 w-4 mr-2" />{saved ? 'Đã lưu!' : 'Lưu thay đổi'}</Button>
        <p className="text-xs text-gray-400">Thay đổi cần được admin duyệt trước khi hiển thị công khai.</p>
      </div>
    </div>
  )
}
