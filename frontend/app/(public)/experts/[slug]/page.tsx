import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, Briefcase, Clock, ExternalLink, Globe, MapPin, Star } from 'lucide-react'
// No direct date-fns imports here — uses lib/utils
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import ReviewCard from '@/components/common/ReviewCard'
import AvailabilityCalendar from '@/components/booking/AvailabilityCalendar'
import { api } from '@/lib/api'
import { EXPERT_CATEGORIES } from '@/constants'
import { formatCurrency } from '@/lib/utils'

export default async function ExpertProfilePage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>
}>) {
  const { slug } = await params
  const expert = await api.experts.bySlug(slug)

  if (!expert) notFound()

  const [reviews, availableSlots] = await Promise.all([
    api.experts.reviews(expert.id),
    api.experts.availability(expert.id),
  ])
  const categoryLabel = EXPERT_CATEGORIES.find((c) => c.value === expert.category)?.label ?? expert.category

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percent: reviews.length > 0
      ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Profile header */}
          <div className="flex gap-5 mb-6">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100">
              <AvatarImage src={expert.profilePictureUrl} alt={expert.displayName} />
              <AvatarFallback className="text-2xl">{expert.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{expert.displayName}</h1>
                  <p className="text-gray-600">{expert.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{expert.company}</span>
                  </div>
                </div>
                {!expert.isAvailable && (
                  <Badge variant="secondary">Hiện không rảnh</Badge>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{expert.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({expert.reviewCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{expert.totalSessions} phiên tư vấn</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{expert.yearsOfExperience} năm kinh nghiệm</span>
                </div>
                <Badge variant="outline">{categoryLabel}</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {expert.languages.map((lang) => (
                  <div key={lang} className="flex items-center gap-1 text-xs text-gray-500">
                    <Globe className="h-3 w-3" />
                    <span>{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Tabs */}
          <Tabs defaultValue="about">
            <TabsList className="mb-6">
              <TabsTrigger value="about">Giới thiệu</TabsTrigger>
              <TabsTrigger value="skills">Kỹ năng & Chứng chỉ</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
              <TabsTrigger value="availability">Lịch rảnh</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Giới thiệu</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{expert.bio}</p>
                {expert.linkedinUrl && (
                  <a
                    href={expert.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem hồ sơ LinkedIn
                  </a>
                )}
                {expert.portfolioUrl && (
                  <a
                    href={expert.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline ml-4"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Kỹ năng chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    {expert.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                {expert.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Chứng chỉ & Học vị</h3>
                    <div className="space-y-3">
                      {expert.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <Award className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">{cert.name}</p>
                            <p className="text-xs text-gray-500">{cert.issuer} · {cert.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {/* Rating summary */}
                <div className="flex gap-8 items-start rounded-xl bg-gray-50 p-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{expert.rating.toFixed(1)}</p>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${star <= Math.round(expert.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">{expert.reviewCount} đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingDistribution.map((d) => (
                      <div key={d.star} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-right text-gray-500">{d.star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${d.percent}%` }} />
                        </div>
                        <span className="w-6 text-gray-400 text-xs">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Chưa có đánh giá nào</p>
                ) : (
                  reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="availability">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Lịch rảnh của chuyên gia</h3>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-400 text-sm">Hiện không có lịch rảnh. Quay lại sau nhé!</p>
                ) : (
                  <AvailabilityCalendar
                    slots={availableSlots}
                    selectedSlots={[]}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <p className="text-sm text-gray-500">Giá tư vấn</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(expert.pricePerSession)}</p>
              <p className="text-xs text-gray-400">/{expert.sessionDurationMinutes} phút/buổi</p>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Kinh nghiệm</span>
                  <span className="font-medium">{expert.yearsOfExperience} năm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phiên đã tư vấn</span>
                  <span className="font-medium">{expert.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Đánh giá</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{expert.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Ngôn ngữ</span>
                  <span className="font-medium">{expert.languages.join(', ')}</span>
                </div>
              </div>

              <Button className="w-full mt-4" size="lg" disabled={!expert.isAvailable} asChild={expert.isAvailable}>
                {expert.isAvailable ? (
                  <Link href={`/booking/${expert.slug}`}>Đặt lịch tư vấn</Link>
                ) : (
                  <span>Hiện không rảnh</span>
                )}
              </Button>

              {expert.isAvailable && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Miễn phí hủy trước 72 giờ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
