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
  qrCode?: string
  bankAccount?: string
  expiresAt?: string
  status?: 'waiting' | 'success' | 'expired'
  onExpire?: () => void
}

function getTimeLeft(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

export default function PaymentCard({
  amount,
  transferCode,
  qrCode,
  bankAccount,
  expiresAt,
  status = 'waiting',
  onExpire,
}: PaymentCardProps) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const updateTimeLeft = () => {
      if (expiresAt) {
        const nextTimeLeft = getTimeLeft(new Date(expiresAt).getTime())
        setTimeLeft(nextTimeLeft)
        if (nextTimeLeft === 0) onExpire?.()
        return nextTimeLeft
      }

      setTimeLeft((current) => Math.max(0, current - 1))
      return null
    }

    if (expiresAt && updateTimeLeft() === 0) return

    const timer = setInterval(() => {
      if (updateTimeLeft() === 0) clearInterval(timer)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

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

  if (status === 'expired' || timeLeft === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-8 text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-orange-700">Thanh toÃ¡n Ä‘Ã£ háº¿t háº¡n</h3>
          <p className="text-orange-600 mt-2">PhiÃªn thanh toÃ¡n nÃ y khÃ´ng cÃ²n hiá»‡u lá»±c.</p>
        </CardContent>
      </Card>
    )
  }

  const accountNumber = bankAccount ?? MOCK_BANK_ACCOUNT.accountNumber

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

        <div className="flex justify-center mb-6">
          <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
            {qrCode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrCode} alt="QR thanh toán" className="h-48 w-48 rounded-lg object-contain" />
            ) : (
              <div className="h-48 w-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2">
                <QrCode className="h-20 w-20 text-gray-400" />
                <span className="text-xs text-gray-400 text-center">Mã QR thanh toán<br />{transferCode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ngân hàng</span>
            <span className="text-sm font-medium">{MOCK_BANK_ACCOUNT.bankName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium">{accountNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(accountNumber, 'account')}
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
