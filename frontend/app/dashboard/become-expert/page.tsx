'use client'

import { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { EXPERT_CATEGORIES } from '@/constants'

const schema = z.object({
  title: z.string().min(3, 'Chức danh tối thiểu 3 ký tự'),
  company: z.string().min(2, 'Tên công ty tối thiểu 2 ký tự'),
  yearsOfExperience: z.number().min(1, 'Cần ít nhất 1 năm kinh nghiệm').max(50),
  category: z.string().min(1, 'Vui lòng chọn lĩnh vực'),
  bio: z.string().min(100, 'Giới thiệu tối thiểu 100 ký tự'),
  pricePerSession: z.number().min(100000, 'Giá tối thiểu 100.000đ'),
  linkedinUrl: z.string().url('URL LinkedIn không hợp lệ').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function BecomeExpertPage() {
  const [submitted, setSubmitted] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const category = watch('category')

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="rounded-full bg-green-100 p-4 inline-flex mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Hồ sơ đã được gửi!</h2>
        <p className="text-gray-500 mb-4">Chúng tôi sẽ xem xét hồ sơ của bạn trong vòng 2-3 ngày làm việc.</p>
        <div className="flex items-center justify-center gap-2 rounded-xl bg-yellow-50 border border-yellow-200 p-4">
          <Clock className="h-5 w-5 text-yellow-600" />
          <span className="text-sm text-yellow-700 font-medium">Đang chờ xem xét</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Đăng ký trở thành chuyên gia</h1>
        <p className="text-gray-500 text-sm mt-1">Chia sẻ kiến thức và kiếm thu nhập từ chuyên môn của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Professional info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Thông tin nghề nghiệp</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Chức danh *</Label>
                <Input id="title" className="mt-1" placeholder="VD: Senior Software Engineer" {...register('title')} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="company">Công ty / Tổ chức *</Label>
                <Input id="company" className="mt-1" placeholder="VD: Google Vietnam" {...register('company')} />
                {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Lĩnh vực chuyên môn *</Label>
                <Select onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">Số năm kinh nghiệm *</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min={1}
                  className="mt-1"
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                />
                {errors.yearsOfExperience && <p className="text-xs text-red-500 mt-1">{errors.yearsOfExperience.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader><CardTitle className="text-base">Giới thiệu bản thân</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              placeholder="Mô tả kinh nghiệm, chuyên môn và những giá trị bạn có thể mang lại cho người được tư vấn... (tối thiểu 100 ký tự)"
              rows={5}
              {...register('bio')}
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader><CardTitle className="text-base">Kỹ năng chuyên môn</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="VD: React, System Design, Financial Modeling..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              />
              <Button type="button" variant="outline" onClick={addSkill}>Thêm</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))}>
                    {s} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Links */}
        <Card>
          <CardHeader><CardTitle className="text-base">Giá tư vấn & Liên kết</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pricePerSession">Giá mỗi buổi tư vấn (VNĐ) *</Label>
              <Input
                id="pricePerSession"
                type="number"
                min={100000}
                step={50000}
                className="mt-1"
                placeholder="VD: 500000"
                {...register('pricePerSession', { valueAsNumber: true })}
              />
              {errors.pricePerSession && <p className="text-xs text-red-500 mt-1">{errors.pricePerSession.message}</p>}
              <p className="text-xs text-gray-400 mt-1">Mỗi buổi tư vấn kéo dài 60 phút. Bạn nhận được 80% sau phí nền tảng.</p>
            </div>
            <Separator />
            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input id="linkedinUrl" className="mt-1" placeholder="https://linkedin.com/in/..." {...register('linkedinUrl')} />
              {errors.linkedinUrl && <p className="text-xs text-red-500 mt-1">{errors.linkedinUrl.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ đăng ký'}
        </Button>
      </form>
    </div>
  )
}
