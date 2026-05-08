import { Search, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpertCard from '../components/ExpertCard';

const MOCK_EXPERTS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    title: 'Chuyên gia tư vấn khởi nghiệp & Chiến lược kinh doanh với hơn 10 năm kinh nghiệm tại các tập đoàn lớn.',
    category: 'Kinh doanh',
    rating: 4.9,
    reviews: 128,
    price: '500.000đ',
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
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop',
  },
];

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--accent-bg)] rounded-full text-[var(--accent)] text-sm font-bold mb-6">
              <Sparkles size={16} />
              <span>Nền tảng kết nối Chuyên gia hàng đầu</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[var(--text-h)] leading-tight mb-6">
              Nâng tầm bản thân cùng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] from-purple-100 to-purple-600">
                Sự tư vấn từ chuyên gia
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-[var(--text)] mb-10 leading-relaxed">
              Kết nối trực tiếp với những người dẫn đầu trong mọi lĩnh vực.
              Nhận lời khuyên thực chiến, giải quyết vấn đề nhanh chóng và hiệu quả.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex flex-col md:flex-row items-center bg-white border border-[var(--border)] rounded-2xl md:rounded-full p-2 shadow-2xl overflow-hidden">
                <div className="flex-grow flex items-center px-4 w-full">
                  <Search className="text-[var(--text)] opacity-40 mr-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm chuyên gia, lĩnh vực, từ khóa..."
                    className="w-full bg-transparent border-none focus:ring-0 text-lg py-3"
                  />
                </div>
                <div className="hidden md:block w-px h-8 bg-[var(--border)] mx-2"></div>
                <button type="button" onClick={() => navigate('/search')} className="flex items-center space-x-2 px-6 py-3 bg-[var(--social-bg)] text-[var(--text-h)] rounded-full hover:bg-[var(--border)] transition-colors mr-2 border border-[var(--accent)]">
                  <Filter size={18} />
                  <span className="font-medium">Lĩnh vực</span>
                </button>
                <button type="submit" className="w-full md:w-auto px-8 py-4 bg-[var(--accent)] rounded-xl md:rounded-full font-medium shadow-lg shadow-[var(--accent)]/20 hover:scale-105 active:scale-95 transition-all border">
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-16">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-[var(--text-h)]">1000+</span>
                <span className="text-sm text-[var(--text)]">Chuyên gia</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-[var(--text-h)]">15k+</span>
                <span className="text-sm text-[var(--text)]">Phiên tư vấn</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-[var(--text-h)]">98%</span>
                <span className="text-sm text-[var(--text)]">Hài lòng</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories / Featured */}
      <section className="py-20 bg-[var(--accent-bg)]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[var(--text-h)] mb-4 flex items-center gap-2">
                <TrendingUp className="text-[var(--accent)]" />
                Chuyên gia nổi bật
              </h2>
              <p className="text-[var(--text)]">Những người được đánh giá cao nhất trong tuần qua.</p>
            </div>
            <button className="mt-4 md:mt-0 text-[var(--accent)] font-bold hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_EXPERTS.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ExpertCard {...expert} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Được tin dùng bởi hơn 50,000+ người dùng</h2>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Just placeholders for logos */}
            <div className="text-2xl font-bold">GOOGLE</div>
            <div className="text-2xl font-bold">META</div>
            <div className="text-2xl font-bold">AMAZON</div>
            <div className="text-2xl font-bold">NETFLIX</div>
            <div className="text-2xl font-bold">APPLE</div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Simple ArrowRight icon helper since it's used
const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
);

export default Home;
