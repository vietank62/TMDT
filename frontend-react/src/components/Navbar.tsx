import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Rocket, Bell, LogOut, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
            <button className="p-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg)]"></span>
            </button>
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
                        <Link
                          to="/mentor/create-session"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] rounded-lg transition-colors font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Plus size={16} /> Tạo phiên tư vấn
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
                    <Link
                      to="/mentor/create-session"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] rounded-xl font-medium transition-colors"
                    >
                      <Plus size={18} /> Tạo phiên tư vấn
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
