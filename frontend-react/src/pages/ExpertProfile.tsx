import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  Award, 
  Calendar, 
  Video, 
  Globe, 
  MessageSquare,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useState } from 'react';

const ExpertProfile = () => {
  useParams(); // Just calling it to satisfy hooks if needed, or remove completely. Let's remove it.
  const [selectedDate, setSelectedDate] = useState('2026-05-10');
  const [selectedSlot, setSelectedSlot] = useState('');

  // Mock data for the specific expert
  const expert = {
    name: 'Nguyễn Văn A',
    title: 'Chuyên gia tư vấn khởi nghiệp & Chiến lược kinh doanh',
    category: 'Kinh doanh',
    rating: 4.9,
    reviewsCount: 128,
    price: '500.000đ',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&auto=format&fit=crop',
    bio: 'Tôi có hơn 10 năm kinh nghiệm trong việc xây dựng và phát triển các startup công nghệ. Tôi đã từng dẫn dắt 3 startup từ giai đoạn ý tưởng đến khi gọi vốn thành công vòng Series A. Phương châm của tôi là mang lại những giá trị thực chiến, có thể áp dụng ngay vào công việc kinh doanh của bạn.',
    skills: ['Chiến lược kinh doanh', 'Gọi vốn đầu tư', 'Marketing thực chiến', 'Quản trị nhân sự'],
    achievements: [
      'Top 10 Chuyên gia tư vấn năm 2025',
      'Đã hỗ trợ hơn 50 startup gọi vốn thành công',
      'Diễn giả tại TechFest 2024'
    ],
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    availability: [
      { date: '2026-05-10', slots: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
      { date: '2026-05-11', slots: ['10:00', '11:00', '13:00', '15:00'] },
    ]
  };

  const reviews = [
    { id: 1, user: 'Lê Minh', rating: 5, comment: 'Anh A tư vấn rất nhiệt tình và sát với thực tế. Những lời khuyên của anh đã giúp công ty tôi tiết kiệm được rất nhiều chi phí marketing.', date: '2 ngày trước' },
    { id: 2, user: 'Phạm Hoa', rating: 5, comment: 'Rất ấn tượng với kiến thức sâu rộng của chuyên gia. Buổi nói chuyện cực kỳ chất lượng.', date: '1 tuần trước' },
  ];

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">
      {/* Header / Banner */}
      <div className="bg-white border-b border-[var(--border)] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img 
                src={expert.image} 
                alt={expert.name} 
                className="w-40 h-40 lg:w-48 lg:h-48 rounded-3xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-2xl shadow-lg">
                <div className="bg-green-500 text-white p-1 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </motion.div>

            <div className="flex-grow text-center lg:text-left">
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold rounded-full uppercase tracking-wider">
                  {expert.category}
                </span>
                <div className="flex items-center text-yellow-500 font-bold">
                  <Star size={18} fill="currentColor" className="mr-1" />
                  <span>{expert.rating}</span>
                  <span className="text-[var(--text)] font-normal ml-1">({expert.reviewsCount} đánh giá)</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[var(--text-h)] mb-4">{expert.name}</h1>
              <p className="text-lg text-[var(--text)] mb-6 max-w-2xl">{expert.title}</p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-[var(--text)]">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-[var(--accent)]" />
                  <span>{expert.languages.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-[var(--accent)]" />
                  <span>Tư vấn qua Video Call</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[var(--accent)]" />
                  <span>Hỗ trợ chat 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Bio */}
            <section className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--text-h)] mb-6 flex items-center gap-2">
                <CheckCircle size={24} className="text-[var(--accent)]" />
                Giới thiệu
              </h2>
              <p className="text-[var(--text)] leading-relaxed text-lg italic">
                "{expert.bio}"
              </p>
              
              <div className="mt-10">
                <h3 className="font-bold text-[var(--text-h)] mb-4">Lĩnh vực chuyên môn:</h3>
                <div className="flex flex-wrap gap-3">
                  {expert.skills.map(skill => (
                    <span key={skill} className="px-4 py-2 bg-gray-50 border border-[var(--border)] rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Achievements */}
            <section className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
              <h2 className="text-2xl font-bold text-[var(--text-h)] mb-6 flex items-center gap-2">
                <Award size={24} className="text-[var(--accent)]" />
                Thành tựu & Kinh nghiệm
              </h2>
              <ul className="space-y-4">
                {expert.achievements.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 bg-[var(--accent)] rounded-full shrink-0" />
                    <span className="text-[var(--text)] text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-h)]">Đánh giá từ khách hàng</h2>
                <button className="text-[var(--accent)] font-bold hover:underline">Xem tất cả</button>
              </div>
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-[var(--text-h)]">{review.user}</h4>
                        <span className="text-xs text-[var(--text)]">{review.date}</span>
                      </div>
                      <div className="flex text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-[var(--text)] leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-8 rounded-3xl border border-[var(--border)] shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[var(--text)] font-medium text-lg">Phí tư vấn</span>
                <span className="text-3xl font-bold text-[var(--accent)]">{expert.price}</span>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-h)] mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-[var(--accent)]" />
                    Chọn ngày tư vấn
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {expert.availability.map(day => (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`py-2 text-sm rounded-xl border transition-all ${
                          selectedDate === day.date 
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' 
                          : 'bg-white border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {day.date}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-h)] mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-[var(--accent)]" />
                    Chọn khung giờ
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expert.availability.find(d => d.date === selectedDate)?.slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-sm rounded-xl border transition-all ${
                          selectedSlot === slot 
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg' 
                          : 'bg-white border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  selectedSlot 
                  ? 'bg-[var(--accent)] text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CreditCard size={20} />
                Tiến hành thanh toán
              </button>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Hoàn tiền 100% nếu chuyên gia vắng mặt</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Bảo mật thông tin tuyệt đối</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for Clock icon if missing
const Clock = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default ExpertProfile;
