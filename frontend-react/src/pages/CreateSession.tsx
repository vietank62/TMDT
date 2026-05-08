import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  Type,
  Layers,
  FileText,
  Video,
  Plus,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Kinh doanh', 'Công nghệ', 'Sức khỏe', 'Marketing', 'Thiết kế', 'Tài chính'];

const CreateSession = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'date' | 'time' | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-[var(--border)] text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-h)] mb-4">Thành công!</h2>
          <p className="text-[var(--text)] mb-8">
            Phiên tư vấn của bạn đã được tạo và hiển thị trên hồ sơ cá nhân.
          </p>
          <div className="animate-pulse text-sm font-medium text-[var(--accent)]">
            Đang chuyển hướng về bảng điều khiển...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-[var(--text-h)] mb-4">Tạo phiên tư vấn mới</h1>
            <p className="text-[var(--text)] text-lg">Chia sẻ kiến thức của bạn và hỗ trợ cộng đồng phát triển.</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border border-[var(--border)] overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {/* Basic Info Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[var(--accent-bg)] text-[var(--accent)] rounded-lg flex items-center justify-center">
                  <Type size={18} />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-h)]">Thông tin cơ bản</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-h)] px-1">Tên phiên tư vấn</label>
                  <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Ví dụ: Chiến lược Gọi vốn Series A"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-h)] px-1">Lĩnh vực</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                    <select
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Chọn lĩnh vực</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-h)] px-1">Mô tả nội dung tư vấn</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-[var(--text)] opacity-40" size={18} />
                  <textarea
                    required
                    rows={4}
                    placeholder="Mô tả chi tiết những gì học viên sẽ nhận được sau buổi tư vấn này..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </section>

            <hr className="border-[var(--border)]" />

            {/* Schedule & Pricing Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[var(--accent-bg)] text-[var(--accent)] rounded-lg flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-h)]">Lịch trình & Chi phí</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Date Selection Collapsible */}
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(expandedSection === 'date' ? null : 'date')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-[var(--accent)]" />
                      <div className="text-left">
                        <p className="text-xs text-[var(--text)] font-medium">Ngày tư vấn</p>
                        <p className="text-sm font-bold text-[var(--text-h)]">
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('vi-VN') : 'Chọn ngày'}
                        </p>
                      </div>
                    </div>
                    {expandedSection === 'date' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <AnimatePresence>
                    {expandedSection === 'date' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-white border-t border-[var(--border)]"
                      >
                        <div className="p-6">
                          <input
                            required
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                              setSelectedDate(e.target.value);
                              setExpandedSection('time');
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Duration Selection Collapsible */}
                <div className="border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-[var(--accent)]" />
                      <div className="text-left">
                        <p className="text-xs text-[var(--text)] font-medium">Thời lượng</p>
                        <p className="text-sm font-bold text-[var(--text-h)]">
                          {selectedDuration} phút
                        </p>
                      </div>
                    </div>
                    {expandedSection === 'time' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <AnimatePresence>
                    {expandedSection === 'time' && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-white border-t border-[var(--border)]"
                      >
                        <div className="p-6">
                          <select
                            required
                            value={selectedDuration}
                            onChange={(e) => {
                              setSelectedDuration(e.target.value);
                              setExpandedSection(null);
                            }}
                            className="w-full px-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="15">15 phút</option>
                            <option value="30">30 phút</option>
                            <option value="60">60 phút</option>
                            <option value="90">90 phút</option>
                            <option value="120">120 phút</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--text-h)] px-1 flex items-center gap-2">
                    <DollarSign size={16} className="text-[var(--accent)]" />
                    Phí tư vấn (VNĐ)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                    <input
                      required
                      type="number"
                      placeholder="500000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--text-h)] px-1">Nền tảng tư vấn</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                  <select
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Trực tiếp">Gặp mặt trực tiếp</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[var(--accent)] rounded-2xl font-bold text-lg shadow-xl shadow-[var(--accent)]/20 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-3 border border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Tạo phiên tư vấn ngay</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <p className="mt-8 text-center text-sm text-[var(--text)]">
          Bằng việc tạo phiên tư vấn, bạn đồng ý với <span className="text-[var(--accent)] font-bold cursor-pointer hover:underline">Chính sách dành cho Chuyên gia</span> của MicroMentor.
        </p>
      </div>
    </div>
  );
};

export default CreateSession;
