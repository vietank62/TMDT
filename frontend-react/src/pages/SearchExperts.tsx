import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ExpertCard from '../components/ExpertCard';

const MOCK_ALL_EXPERTS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    title: 'Chuyên gia tư vấn khởi nghiệp & Chiến lược kinh doanh với hơn 10 năm kinh nghiệm tại các tập đoàn lớn.',
    category: 'Kinh doanh',
    rating: 4.9,
    reviews: 128,
    price: '500.000đ',
    experience: 10,
    priceValue: 500000,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    title: 'Senior Software Architect tại Thung lũng Silicon. Hỗ trợ định hướng sự nghiệp và kỹ thuật hệ thống.',
    category: 'Công nghệ',
    rating: 5.0,
    reviews: 85,
    price: '800.000đ',
    experience: 8,
    priceValue: 800000,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    title: 'Chuyên gia Tâm lý học lâm sàng. Giúp bạn vượt qua áp lực công việc và cân bằng cuộc sống.',
    category: 'Sức khỏe',
    rating: 4.8,
    reviews: 210,
    price: '400.000đ',
    experience: 5,
    priceValue: 400000,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '4',
    name: 'Phạm Minh D',
    title: 'Digital Marketing Expert. Tối ưu hóa chuyển đổi và xây dựng thương hiệu cá nhân bền vững.',
    category: 'Marketing',
    rating: 4.9,
    reviews: 95,
    price: '450.000đ',
    experience: 4,
    priceValue: 450000,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    title: 'Giám đốc Sáng tạo. Chuyên tư vấn thiết kế UI/UX và xây dựng thương hiệu.',
    category: 'Thiết kế',
    rating: 4.7,
    reviews: 64,
    price: '600.000đ',
    experience: 6,
    priceValue: 600000,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop',
  },
  {
    id: '6',
    name: 'Đặng Thu F',
    title: 'Chuyên gia tài chính cá nhân. Hoạch định chi tiêu và đầu tư thông minh.',
    category: 'Tài chính',
    rating: 4.9,
    reviews: 150,
    price: '1.200.000đ',
    experience: 12,
    priceValue: 1200000,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop',
  }
];

const CATEGORIES = ['Tất cả', 'Kinh doanh', 'Công nghệ', 'Sức khỏe', 'Marketing', 'Thiết kế', 'Tài chính'];
const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: 99999999 },
  { label: 'Dưới 500.000đ', min: 0, max: 500000 },
  { label: '500.000đ - 1.000.000đ', min: 500000, max: 1000000 },
  { label: 'Trên 1.000.000đ', min: 1000000, max: 99999999 },
];
const EXPERIENCE_RANGES = [
  { label: 'Tất cả', min: 0, max: 100 },
  { label: 'Dưới 3 năm', min: 0, max: 3 },
  { label: '3 - 7 năm', min: 3, max: 7 },
  { label: 'Trên 7 năm', min: 7, max: 100 },
];

const SearchExperts = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_RANGES[0]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Filter Logic
  const filteredExperts = MOCK_ALL_EXPERTS.filter(expert => {
    const matchesQuery = expert.name.toLowerCase().includes(query.toLowerCase()) ||
      expert.title.toLowerCase().includes(query.toLowerCase()) ||
      expert.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || expert.category === selectedCategory;
    const matchesPrice = expert.priceValue >= selectedPrice.min && expert.priceValue <= selectedPrice.max;
    const matchesExp = expert.experience >= selectedExp.min && expert.experience <= selectedExp.max;

    return matchesQuery && matchesCategory && matchesPrice && matchesExp;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-8 pb-20">
      {/* Search Header */}
      <div className="bg-[var(--accent)] py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Tìm kiếm chuyên gia phù hợp với bạn
          </h1>
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative">
            <div className="relative flex items-center bg-white rounded-full p-2 shadow-lg">
              <Search className="text-gray-400 ml-4 mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên chuyên gia, lĩnh vực, từ khóa..."
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-lg py-2"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[var(--accent)]  rounded-full font-bold hover:bg-purple-700 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <button
          className="lg:hidden flex items-center justify-center space-x-2 w-full py-3 bg-[var(--social-bg)] rounded-xl font-bold text-[var(--text-h)] border border-[var(--border)]"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal size={20} />
          <span>Bộ lọc tìm kiếm</span>
          <ChevronDown size={20} className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Sidebar Filters */}
        <aside className={`lg:w-1/4 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm sticky top-24">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[var(--border)]">
              <Filter size={20} className="text-[var(--accent)]" />
              <h2 className="text-xl font-bold text-[var(--text-h)]">Bộ lọc</h2>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--text-h)] mb-4 flex items-center">
                Chuyên ngành
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                      ${selectedCategory === cat ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-gray-300 group-hover:border-[var(--accent)]'}`}
                    >
                      {selectedCategory === cat && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                    </div>
                    <span className={`text-sm ${selectedCategory === cat ? 'font-bold text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--text-h)] mb-4">Mức giá</h3>
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <label key={range.label} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                      ${selectedPrice.label === range.label ? 'border-[var(--accent)]' : 'border-gray-300 group-hover:border-[var(--accent)]'}`}
                    >
                      {selectedPrice.label === range.label && <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full" />}
                    </div>
                    <span className={`text-sm ${selectedPrice.label === range.label ? 'font-bold text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="mb-8">
              <h3 className="font-bold text-[var(--text-h)] mb-4">Năm kinh nghiệm</h3>
              <div className="space-y-2">
                {EXPERIENCE_RANGES.map((range) => (
                  <label key={range.label} className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                      ${selectedExp.label === range.label ? 'border-[var(--accent)]' : 'border-gray-300 group-hover:border-[var(--accent)]'}`}
                    >
                      {selectedExp.label === range.label && <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full" />}
                    </div>
                    <span className={`text-sm ${selectedExp.label === range.label ? 'font-bold text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              className="w-full py-3 bg-[var(--social-bg)] text-[var(--text-h)] font-bold rounded-xl hover:bg-[var(--border)] transition-colors"
              onClick={() => {
                setSelectedCategory('Tất cả');
                setSelectedPrice(PRICE_RANGES[0]);
                setSelectedExp(EXPERIENCE_RANGES[0]);
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--text-h)]">
              Tìm thấy <span className="text-[var(--accent)]">{filteredExperts.length}</span> chuyên gia
            </h2>

            {/* Sort Dropdown placeholder */}
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-[var(--text)]">Sắp xếp theo:</span>
              <select className="bg-transparent font-bold text-[var(--text-h)] border-none focus:ring-0 cursor-pointer">
                <option>Đề xuất</option>
                <option>Đánh giá cao nhất</option>
                <option>Giá thấp đến cao</option>
                <option>Giá cao đến thấp</option>
              </select>
            </div>
          </div>

          {filteredExperts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExpertCard
                    id={expert.id}
                    name={expert.name}
                    title={expert.title}
                    category={expert.category}
                    rating={expert.rating}
                    reviews={expert.reviews}
                    price={expert.price}
                    image={expert.image}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-[var(--border)] text-center">
              <div className="w-24 h-24 bg-[var(--social-bg)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-[var(--text)] opacity-40" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-h)] mb-2">Không tìm thấy kết quả</h3>
              <p className="text-[var(--text)] mb-6 max-w-md mx-auto">
                Chúng tôi không tìm thấy chuyên gia nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng thử lại với các tiêu chí khác.
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('Tất cả');
                  setSelectedPrice(PRICE_RANGES[0]);
                  setSelectedExp(EXPERIENCE_RANGES[0]);
                }}
                className="px-8 py-3 bg-[var(--accent)] rounded-full font-bold hover:scale-105 transition-transform"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchExperts;
