import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Rocket, Bell, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


interface Notification {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Phiên tư vấn được xác nhận',
    content: 'Chuyên gia Nguyễn Minh đã xác nhận buổi tư vấn lúc 14:00 hôm nay.',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    title: 'Đánh giá mới',
    content: 'Bạn nhận được đánh giá 5 sao từ khách hàng Trần Thị Lan.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    title: 'Nhắc nhở lịch hẹn',
    content: 'Bạn có buổi tư vấn với Lê Văn Hùng vào lúc 09:00 ngày mai.',
    time: '3 giờ trước',
    read: true,
  },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: number) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));


  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Khám phá', path: '/' },
    { name: 'Chuyên gia', path: '/search' },
    { name: 'Về chúng tôi', path: '/about' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)] py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent)]/20 group-hover:scale-110 transition-transform">
              <Rocket size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[var(--text-h)]">
              Micro<span className="text-[var(--accent)]">Mentor</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[var(--accent)] ${location.pathname === link.path ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-5">
            <button onClick={() => navigate('/search')} className="p-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              <Search size={20} />
            </button>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-(--text) hover:text-(--accent) transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-(--bg)"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-(--border) overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) bg-gray-50">
                      <span className="text-sm font-bold text-(--text-h)">
                        Thông báo {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-(--accent) hover:underline">
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-(--border)">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-center text-(--text)">Không có thông báo</p>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${notif.read ? '' : 'bg-blue-50/50'}`}
                            onClick={() => markRead(notif.id)}
                          >
                            <div className="flex items-start gap-2">
                              {notif.read ? (
                                <div className="pl-4">
                                  <p className="text-sm font-semibold text-(--text-h)">{notif.title}</p>
                                  <p className="text-xs text-(--text) mt-0.5 leading-relaxed">{notif.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                </div>
                              ) : (
                                <>
                                  <span className="mt-1.5 w-2 h-2 shrink-0 bg-blue-500 rounded-full"></span>
                                  <div>
                                    <p className="text-sm font-semibold text-(--text-h)">{notif.title}</p>
                                    <p className="text-xs text-(--text) mt-0.5 leading-relaxed">{notif.content}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                  </div>
                                </>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent)]"
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[var(--border)] bg-gray-50">
                        <p className="text-sm font-bold text-[var(--text-h)] truncate">{user.name}</p>
                        <p className="text-xs text-[var(--text)] truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] rounded-lg transition-colors font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User size={16} /> Bảng điều khiển
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                          <LogOut size={16} /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-5 py-2.5 bg-[var(--accent)] rounded-full font-medium shadow-lg shadow-[var(--accent)]/25 hover:opacity-90 hover:scale-105 active:scale-95 transition-all"
              >
                <User size={18} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[var(--text-h)]"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--bg)] border-b border-[var(--border)] overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] rounded-xl transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] pb-4">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[var(--border)]" />
                      <div>
                        <p className="font-bold text-[var(--text-h)]">{user.name}</p>
                        <p className="text-sm text-[var(--text)]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] rounded-xl font-medium transition-colors"
                    >
                      <User size={18} /> Bảng điều khiển
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 px-5 py-3 bg-[var(--accent)] rounded-xl font-medium shadow-lg"
                  >
                    <User size={18} />
                    <span>Đăng nhập</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
