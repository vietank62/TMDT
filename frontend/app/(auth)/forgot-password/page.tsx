'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Email đã được gửi!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.
        </p>
        <Link href="/sign-in" className="text-blue-600 hover:underline text-sm">
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Quên mật khẩu?</h1>
      <p className="text-gray-500 text-sm mb-6">Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="example@gmail.com" className="mt-1" {...register('email')} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message as string}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi email đặt lại'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/sign-in" className="text-blue-600 hover:underline">← Quay lại đăng nhập</Link>
      </p>
    </div>
  )
}
