'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Copy, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MOCK_BANK_ACCOUNT } from '@/constants'

interface PaymentCardProps {
  amount: number
  transferCode: string
  onSuccess?: () => void
}

export default function PaymentCard({ amount, transferCode, onSuccess }: PaymentCardProps) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60) // 24 hours in seconds
  const [status, setStatus] = useState<'waiting' | 'success' | 'expired'>('waiting')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          setStatus('expired')
          return 0
        }
        return t - 1
      })
    }, 1000)

    // Simulate payment success after 12 seconds
    const successTimer = setTimeout(() => {
      setStatus('success')
      onSuccess?.()
    }, 12000)

    return () => {
      clearInterval(timer)
      clearTimeout(successTimer)
    }
  }, [onSuccess])

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  if (status === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700">Thanh toán thành công!</h3>
          <p className="text-green-600 mt-2">Buổi tư vấn của bạn đã được xác nhận.</p>
          <p className="text-sm text-green-500 mt-1">Số tiền: {formatCurrency(amount)}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Thanh toán qua SEPay</h3>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="font-mono font-bold text-orange-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="flex justify-center mb-6">
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
            <div className="h-48 w-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2">
              <QrCode className="h-20 w-20 text-gray-400" />
              <span className="text-xs text-gray-400 text-center">Mã QR thanh toán<br />{transferCode}</span>
            </div>
          </div>
        </div>

        {/* Transfer info */}
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ngân hàng</span>
            <span className="text-sm font-medium">{MOCK_BANK_ACCOUNT.bankName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium">{MOCK_BANK_ACCOUNT.accountNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(MOCK_BANK_ACCOUNT.accountNumber, 'account')}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {copied === 'account' && <span className="text-xs text-green-500">Đã sao chép</span>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Chủ tài khoản</span>
            <span className="text-sm font-medium">{MOCK_BANK_ACCOUNT.accountName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Số tiền</span>
            <span className="text-sm font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Nội dung CK</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium">{transferCode}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(transferCode, 'code')}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {copied === 'code' && <span className="text-xs text-green-500">Đã sao chép</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-sm text-gray-500">Đang chờ xác nhận thanh toán...</span>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Vui lòng chuyển khoản đúng nội dung để được xác nhận tự động. Thanh toán sẽ hết hạn sau {formatTime(timeLeft)}.
        </p>
      </CardContent>
    </Card>
  )
}
