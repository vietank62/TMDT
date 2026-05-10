'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import ExpertCard from '@/components/common/ExpertCard'
import { mockExperts } from '@/data/experts'
import { EXPERT_CATEGORIES, PRICE_RANGES, RATING_OPTIONS } from '@/constants'

export default function ExpertsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState('rating_desc')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = mockExperts
    .filter((e) => {
      if (search) {
        const q = search.toLowerCase()
        return (
          e.displayName.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.skills.some((s) => s.toLowerCase().includes(q)) ||
          e.company.toLowerCase().includes(q)
        )
      }
      return true
    })
    .filter((e) => {
      if (selectedCategories.length > 0) return selectedCategories.includes(e.category)
      return true
    })
    .filter((e) => {
      if (!selectedPriceRange) return true
      const [min, max] = selectedPriceRange.split('-').map((v) => (v === '+' ? Infinity : Number(v)))
      return e.pricePerSession >= (Number(selectedPriceRange.split('-')[0]) || 0) &&
        (max === undefined || e.pricePerSession <= max)
    })
    .filter((e) => {
      if (!minRating) return true
      return e.rating >= parseFloat(minRating)
    })
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating
      if (sortBy === 'price_asc') return a.pricePerSession - b.pricePerSession
      if (sortBy === 'price_desc') return b.pricePerSession - a.pricePerSession
      if (sortBy === 'experience_desc') return b.yearsOfExperience - a.yearsOfExperience
      if (sortBy === 'sessions_desc') return b.totalSessions - a.totalSessions
      return 0
    })

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách chuyên gia</h1>
        <p className="text-gray-500 mt-1">{filtered.length} chuyên gia phù hợp</p>
      </div>

      {/* Search and sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, kỹ năng, lĩnh vực..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating_desc">Đánh giá cao nhất</SelectItem>
            <SelectItem value="price_asc">Giá thấp nhất</SelectItem>
            <SelectItem value="price_desc">Giá cao nhất</SelectItem>
            <SelectItem value="experience_desc">Nhiều kinh nghiệm nhất</SelectItem>
            <SelectItem value="sessions_desc">Nhiều phiên nhất</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
          {(selectedCategories.length > 0 || selectedPriceRange || minRating) && (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs">
              {selectedCategories.length + (selectedPriceRange ? 1 : 0) + (minRating ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filter Panel */}
        {showFilters && (
          <aside className="w-56 shrink-0">
            <div className="sticky top-20 space-y-6">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Lĩnh vực</h3>
                <div className="space-y-2">
                  {EXPERT_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center gap-2">
                      <Checkbox
                        id={cat.value}
                        checked={selectedCategories.includes(cat.value)}
                        onCheckedChange={() => toggleCategory(cat.value)}
                      />
                      <Label htmlFor={cat.value} className="text-sm cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <div key={range.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`price-${range.value}`}
                        checked={selectedPriceRange === range.value}
                        onCheckedChange={() =>
                          setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)
                        }
                      />
                      <Label htmlFor={`price-${range.value}`} className="text-sm cursor-pointer">
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Đánh giá tối thiểu</h3>
                <div className="space-y-2">
                  {RATING_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`rating-${opt.value}`}
                        checked={minRating === opt.value}
                        onCheckedChange={() =>
                          setMinRating(minRating === opt.value ? '' : opt.value)
                        }
                      />
                      <Label htmlFor={`rating-${opt.value}`} className="text-sm cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedPriceRange('')
                  setMinRating('')
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </aside>
        )}

        {/* Expert grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="h-10 w-10 mx-auto mb-3" />
              <p className="font-medium">Không tìm thấy chuyên gia phù hợp</p>
              <p className="text-sm mt-1">Thử điều chỉnh từ khóa hoặc bộ lọc</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
