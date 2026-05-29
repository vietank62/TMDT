'use client'

import { useEffect, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from '@/types'
import { api } from '@/lib/api'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', phone: '' },
  })

  useEffect(() => {
    let mounted = true
    api.auth.me()
      .then((data) => {
        if (!mounted) return
        setUser(data)
        profileForm.reset({ fullName: data.fullName, email: data.email, phone: data.phone ?? '' })
      })
      .catch((err: Error) => {
        if (mounted) setError(err.message)
      })
    return () => {
      mounted = false
    }
  }, [profileForm])

  async function onSaveProfile(values: ProfileForm) {
    const updated = await api.users.updateMe({
      full_name: values.fullName,
      phone_number: values.phone ?? '',
    })
    setUser(updated)
    profileForm.reset({ fullName: updated.fullName, email: updated.email, phone: updated.phone ?? '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      {error && <Card><CardContent className="p-6 text-sm text-red-500">{error}</CardContent></Card>}

      <Card>
        <CardHeader><CardTitle className="text-base">Ảnh đại diện</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-2xl">{user?.fullName?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <button type="button" className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.fullName ?? 'Đang tải...'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <Button variant="outline" size="sm" className="mt-2" disabled>Tải ảnh lên</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cá nhân</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" className="mt-1" {...profileForm.register('fullName')} />
                {profileForm.formState.errors.fullName && <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" className="mt-1" placeholder="0901234567" {...profileForm.register('phone')} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1" disabled {...profileForm.register('email')} />
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {profileForm.formState.isSubmitting ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
