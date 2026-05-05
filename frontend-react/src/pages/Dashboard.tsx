import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Video, 
  Settings, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('sessions');

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
                { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
                { id: 'payments', label: 'Lịch sử thanh toán', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all ${
                    activeTab === item.id 
                    ? 'bg-[var(--accent)] text-white shadow-lg' 
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--text-h)]">Lịch sắp tới</h2>
                    <span className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold rounded-full">
                      {upcomingSessions.length} phiên
                    </span>
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
                            className="flex-grow md:flex-grow-0 px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
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
                  <button className="px-8 py-4 bg-[var(--accent)] text-white rounded-2xl font-bold shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all">
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
