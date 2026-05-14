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
import { resetPassword, getFirebaseErrorMessage } from '@/lib/firebase-auth'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setAuthError(null)
    try {
      await resetPassword(data.email)
      setSent(true)
    } catch (err) {
      setAuthError(getFirebaseErrorMessage(err))
    }
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
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {authError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {authError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Đang gửi...' : 'Gửi hướng dẫn'}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        <Link href="/sign-in" className="text-blue-600 hover:underline">Quay lại đăng nhập</Link>
      </p>
    </div>
  )
}
