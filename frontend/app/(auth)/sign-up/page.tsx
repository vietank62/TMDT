'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const schema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'expert']),
  agreeTerms: z.boolean().refine((v) => v, 'Bạn phải đồng ý với điều khoản'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user', agreeTerms: false },
  })

  const role = watch('role')
  const agreeTerms = watch('agreeTerms')

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 1000))
    window.location.href = '/dashboard/consultations'
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo tài khoản mới</h1>
      <p className="text-gray-500 text-sm mb-6">Bắt đầu hành trình tư vấn của bạn</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input id="fullName" placeholder="Nguyễn Văn A" className="mt-1" {...register('fullName')} />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="example@gmail.com" className="mt-1" {...register('email')} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative mt-1">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" className="mt-1" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <Label className="mb-2 block">Bạn là?</Label>
          <RadioGroup value={role} onValueChange={(v) => setValue('role', v as 'user' | 'expert')} className="flex gap-4">
            <div className={`flex-1 flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${role === 'user' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <RadioGroupItem value="user" id="role-user" />
              <Label htmlFor="role-user" className="cursor-pointer">
                <span className="font-medium">Người dùng</span>
                <p className="text-xs text-gray-400">Tìm kiếm tư vấn</p>
              </Label>
            </div>
            <div className={`flex-1 flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${role === 'expert' ? 'border-blue-500 bg-blue-50' : ''}`}>
              <RadioGroupItem value="expert" id="role-expert" />
              <Label htmlFor="role-expert" className="cursor-pointer">
                <span className="font-medium">Chuyên gia</span>
                <p className="text-xs text-gray-400">Chia sẻ kiến thức</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="agree"
            checked={agreeTerms}
            onCheckedChange={(v) => setValue('agreeTerms', !!v)}
            className="mt-0.5"
          />
          <Label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
            Tôi đồng ý với{' '}
            <Link href="#" className="text-blue-600 hover:underline">Điều khoản sử dụng</Link>
            {' '}và{' '}
            <Link href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>
          </Label>
        </div>
        {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-400">hoặc</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="outline" className="w-full">
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Đăng ký với Google
      </Button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Đã có tài khoản?{' '}
        <Link href="/sign-in" className="text-blue-600 font-medium hover:underline">Đăng nhập</Link>
      </p>
    </div>
  )
}
