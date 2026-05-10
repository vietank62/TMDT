import Link from 'next/link'
import { ArrowRight, CheckCircle, Search, Shield, Star, Users, Video, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ExpertCard from '@/components/common/ExpertCard'
import ReviewCard from '@/components/common/ReviewCard'
import KPIStatCard from '@/components/common/KPIStatCard'
import { mockExperts } from '@/data/experts'
import { mockReviews } from '@/data/reviews'

export default function HomePage() {
  const featuredExperts = mockExperts.filter((e) => e.isAvailable).slice(0, 4)
  const testimonials = mockReviews.filter((r) => r.isPublic).slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>Hơn 500 chuyên gia được xác minh</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Tìm chuyên gia tư vấn<br />
            <span className="text-yellow-400">cho mọi vấn đề</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Kết nối với các chuyên gia hàng đầu trong 15 phút. Giải quyết vấn đề của bạn qua các buổi tư vấn ngắn, hiệu quả và giá cả hợp lý.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên, kỹ năng hoặc lĩnh vực..."
                className="pl-9 bg-white text-gray-900 border-0 h-11"
              />
            </div>
            <Button size="lg" variant="secondary" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 h-11" asChild>
              <Link href="/experts">Tìm kiếm ngay</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-blue-200">
            {['Công nghệ', 'Kinh doanh', 'Tài chính', 'Marketing', 'Thiết kế', 'Khởi nghiệp'].map((tag) => (
              <Link key={tag} href={`/experts?category=${tag}`} className="hover:text-white transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-white py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">500+</p>
              <p className="text-sm text-gray-500 mt-1">Chuyên gia được xác minh</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">10,000+</p>
              <p className="text-sm text-gray-500 mt-1">Buổi tư vấn thành công</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">4.8★</p>
              <p className="text-sm text-gray-500 mt-1">Điểm đánh giá trung bình</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">98%</p>
              <p className="text-sm text-gray-500 mt-1">Tỷ lệ hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Experts */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chuyên gia nổi bật</h2>
              <p className="text-gray-500 mt-1">Các chuyên gia được đánh giá cao nhất tuần này</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/experts">Xem tất cả <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {featuredExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cách thức hoạt động</h2>
          <p className="text-gray-500 mb-12">Chỉ 3 bước đơn giản để có buổi tư vấn chất lượng</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: '1. Tìm chuyên gia',
                desc: 'Duyệt danh sách chuyên gia theo lĩnh vực, xem hồ sơ và đánh giá chi tiết.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Video,
                title: '2. Đặt lịch & Thanh toán',
                desc: 'Chọn khung giờ phù hợp, mô tả vấn đề và thanh toán an toàn qua SEPay.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Zap,
                title: '3. Tư vấn trực tuyến',
                desc: 'Tham gia buổi tư vấn video trực tiếp và nhận lời khuyên từ chuyên gia.',
                color: 'bg-green-50 text-green-600',
              },
            ].map((step) => (
              <div key={step.title} className="flex flex-col items-center">
                <div className={`rounded-2xl p-4 mb-4 ${step.color}`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 text-center">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Tại sao chọn MicroMentor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Chuyên gia xác minh', desc: 'Tất cả chuyên gia được kiểm tra và xác minh hồ sơ kỹ lưỡng.' },
              { icon: CheckCircle, title: 'Hoàn tiền đảm bảo', desc: 'Không hài lòng? Chúng tôi hoàn tiền theo chính sách rõ ràng.' },
              { icon: Users, title: 'Cộng đồng đa dạng', desc: 'Chuyên gia từ 15+ lĩnh vực khác nhau.' },
              { icon: Zap, title: 'Kết nối nhanh', desc: 'Đặt lịch và bắt đầu tư vấn chỉ trong vài phút.' },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex rounded-xl bg-white/10 p-3 mb-3">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Người dùng nói gì</h2>
          <p className="text-center text-gray-500 mb-10">Đánh giá thực tế từ người dùng đã tư vấn</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Bắt đầu hành trình tư vấn ngay hôm nay</h2>
          <p className="text-gray-500 mb-8">Tham gia cùng hàng nghìn người dùng đang được tư vấn bởi các chuyên gia hàng đầu.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Đăng ký miễn phí</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/experts">Khám phá chuyên gia</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
