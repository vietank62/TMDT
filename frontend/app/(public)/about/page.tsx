import { Shield, Star, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Về MicroMentor</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Chúng tôi xây dựng nền tảng kết nối tri thức — nơi mọi người có thể tiếp cận kiến thức chuyên môn một cách nhanh chóng, hiệu quả và hợp lý.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="rounded-xl bg-blue-50 p-6">
          <h2 className="font-bold text-xl text-gray-900 mb-3">Sứ mệnh của chúng tôi</h2>
          <p className="text-gray-600 leading-relaxed">
            MicroMentor tin rằng mọi người đều xứng đáng được tiếp cận với lời khuyên chuyên môn chất lượng cao. Chúng tôi loại bỏ rào cản về địa lý, thời gian và chi phí để kết nối bạn với đúng người có thể giúp bạn tiến xa hơn.
          </p>
        </div>
        <div className="rounded-xl bg-purple-50 p-6">
          <h2 className="font-bold text-xl text-gray-900 mb-3">Tầm nhìn</h2>
          <p className="text-gray-600 leading-relaxed">
            Trở thành nền tảng tư vấn chuyên gia số 1 Đông Nam Á, nơi tri thức được chia sẻ một cách có giá trị và bền vững cho cả chuyên gia và người học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 text-center">
        {[
          { icon: Users, value: '500+', label: 'Chuyên gia' },
          { icon: Star, value: '10K+', label: 'Buổi tư vấn' },
          { icon: Shield, value: '100%', label: 'Được xác minh' },
          { icon: Zap, value: '98%', label: 'Hài lòng' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border p-4">
            <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sẵn sàng bắt đầu?</h2>
        <div className="flex justify-center gap-3">
          <Button asChild><Link href="/experts">Tìm chuyên gia</Link></Button>
          <Button variant="outline" asChild><Link href="/sign-up">Đăng ký ngay</Link></Button>
        </div>
      </div>
    </div>
  )
}
