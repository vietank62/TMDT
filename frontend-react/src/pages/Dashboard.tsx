import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  User,
  Video,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedDate, setSelectedDate] = useState('2026-05-10');
  const [expandedSection, setExpandedSection] = useState<'date' | 'time' | null>(null);

  const upcomingSessions = [
    { id: 1, expert: 'Nguyễn Văn A', date: '10/05/2026', time: '09:00 - 10:00', type: 'Video Call', link: 'https://meet.google.com/abc-def-ghi' },
    { id: 2, expert: 'Trần Thị B', date: '12/05/2026', time: '14:00 - 15:00', type: 'Video Call', link: '#' },
  ];

  const pastSessions = [
    { id: 3, expert: 'Lê Văn C', date: '01/05/2026', time: '10:00 - 11:00', status: 'Hoàn thành' },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm text-center mb-8">
              <div className="relative inline-block mb-4">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[var(--accent-bg)]"
                  alt="Avatar"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <h3 className="font-bold text-xl text-[var(--text-h)]">Lê Minh Tuấn</h3>
              <p className="text-sm text-[var(--text)]">Thành viên từ 2024</p>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'sessions', label: 'Lịch tư vấn', icon: Calendar },
                { id: 'availability', label: 'Quản lý lịch rảnh', icon: Clock },
                { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
                { id: 'payments', label: 'Lịch sử thanh toán', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all ${activeTab === item.id
                    ? 'bg-[var(--accent)] shadow-lg'
                    : 'bg-white text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === item.id ? 'opacity-100' : 'opacity-0'} />
                </button>
              ))}
              <button className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-medium text-red-500 hover:bg-red-50 transition-all mt-8">
                <LogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>

          {/* Main Dashboard Content */}
          <div className="lg:col-span-3">
            {activeTab === 'sessions' && (
              <div className="space-y-8">
                {/* Upcoming */}
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-[var(--text-h)]">Lịch sắp tới</h2>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold rounded-full">
                        {upcomingSessions.length} phiên
                      </span>
                      <Link
                        to="/mentor/create-session"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all"
                      >
                        <Plus size={16} />
                        <span>Tạo phiên mới</span>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {upcomingSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-[var(--accent-bg)] rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0">
                            <Video size={28} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[var(--text-h)]">Tư vấn với {session.expert}</h4>
                            <div className="flex flex-wrap gap-4 text-sm text-[var(--text)] mt-1">
                              <span className="flex items-center gap-1"><Calendar size={14} /> {session.date}</span>
                              <span className="flex items-center gap-1"><Clock size={14} /> {session.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <a
                            href={session.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow md:flex-grow-0 px-6 py-3 bg-[var(--accent)] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
                          >
                            <span>Tham gia ngay</span>
                            <ExternalLink size={16} />
                          </a>
                          <button className="p-3 bg-gray-50 text-[var(--text)] rounded-xl hover:bg-gray-100 transition-colors">
                            <Settings size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Past */}
                <section>
                  <h2 className="text-2xl font-bold text-[var(--text-h)] mb-6">Lịch sử tư vấn</h2>
                  <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-[var(--border)]">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Chuyên gia</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Ngày</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {pastSessions.map((session) => (
                          <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-[var(--text-h)]">{session.expert}</td>
                            <td className="px-6 py-4 text-sm text-[var(--text)]">{session.date}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">
                                <CheckCircle2 size={14} />
                                {session.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--accent)] font-bold cursor-pointer hover:underline">Xem đánh giá</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'availability' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-h)]">Quản lý khung giờ rảnh</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Date Selection Collapsible */}
                  <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'date' ? null : 'date')}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl">
                          <Calendar size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-[var(--text-h)]">Chọn ngày quản lý</h3>
                          <p className="text-sm text-[var(--text)]">{selectedDate}</p>
                        </div>
                      </div>
                      {expandedSection === 'date' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                      {expandedSection === 'date' && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-[var(--border)]"
                        >
                          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13'].map((date) => (
                              <button
                                key={date}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setExpandedSection('time');
                                }}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedDate === date
                                  ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg'
                                  : 'bg-gray-50 border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'
                                  }`}
                              >
                                <span className="font-bold">{date}</span>
                                <CheckCircle2 size={18} className={selectedDate === date ? 'text-black' : 'text-green-500'} />
                              </button>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-all font-bold">
                              <Plus size={18} />
                              <span>Thêm ngày mới</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slot Selection Collapsible */}
                  <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl">
                          <Clock size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-[var(--text-h)]">Quản lý khung giờ</h3>
                          <p className="text-sm text-[var(--text)]">Đang xem ngày {selectedDate}</p>
                        </div>
                      </div>
                      {expandedSection === 'time' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                      {expandedSection === 'time' && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-[var(--border)]"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-h-80 overflow-y-auto p-1 scrollbar-thin">
                              {['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45'].map((slot) => {
                                const isBooked = ['09:15', '10:30'].includes(slot);
                                return (
                                  <div
                                    key={slot}
                                    className={`flex items-center justify-between p-3 rounded-xl group border transition-all ${isBooked
                                      ? 'bg-green-50 border-green-100'
                                      : 'bg-gray-50 border-[var(--border)]'}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`font-medium ${isBooked ? 'text-green-700' : 'text-[var(--text-h)]'}`}>{slot}</span>
                                      {isBooked && <CheckCircle2 size={14} className="text-green-500" />}
                                    </div>
                                    {!isBooked && (
                                      <button className="p-1.5 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all">
                                        <Plus size={14} className="rotate-45" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <button className="w-full py-4 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl font-bold hover:bg-[var(--accent)] hover: transition-all flex items-center justify-center gap-2 border border-dashed border-[var(--accent)]">
                              <Plus size={20} />
                              <span>Thêm khung giờ (15p)</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                <h2 className="text-2xl font-bold text-[var(--text-h)] mb-8">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">Họ và tên</label>
                    <input type="text" defaultValue="Lê Minh Tuấn" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">Email</label>
                    <input type="email" defaultValue="tuan.le@example.com" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">Số điện thoại</label>
                    <input type="text" defaultValue="0987654321" className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--text)]">Lĩnh vực quan tâm</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none">
                      <option>Kinh doanh</option>
                      <option>Công nghệ</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <button className="px-8 py-4 bg-[var(--accent)] rounded-2xl font-bold shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all">
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
