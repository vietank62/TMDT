import { useState, useEffect } from 'react';
import thgvu from '../assets/thgvu.jpg';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Rocket, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
// ... (omitting GoogleIcon code for brevity in prompt but I'll replace it correctly)
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Auth = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register
    login({
      id: 'usr_123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&h=150&auto=format&fit=crop',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-4 py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        layout
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--border)]"
      >
        {/* Left Side - Image/Promotion */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--accent)] text-white relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <img src={thgvu} className="w-full h-full object-cover opacity-90" alt="Background" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--accent)]/40 to-[var(--accent)]/80"></div>
          </div>

          <Link to="/" className="flex items-center space-x-2 relative z-10">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Rocket size={24} />
            </div>
            <span className="text-2xl font-bold">MicroMentor</span>
          </Link>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Bắt đầu hành trình <br /> chinh phục tri thức.
            </h2>
            <p className=" text-lg leading-relaxed mb-8">
              Hàng ngàn chuyên gia hàng đầu đã sẵn sàng hỗ trợ bạn. Tham gia ngay để mở khóa tiềm năng của bản thân.
            </p>

            <div className="space-y-4">
              {[
                'Kết nối trực tiếp 1-1',
                'Cố vấn từ những người giỏi nhất',
                'Lịch trình linh hoạt',
                'Hỗ trợ thanh toán an toàn'
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm relative z-10">
            <span>Privacy Policy</span>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <span>Terms of Service</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 lg:p-16">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[var(--text-h)] mb-2">
              {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
            </h1>
            <p className="text-[var(--text)]">
              {isLogin
                ? 'Đăng nhập để tiếp tục hành trình của bạn.'
                : 'Trở thành một phần của cộng đồng MicroMentor.'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-[var(--border)] rounded-2xl font-bold text-[var(--text-h)] hover:bg-gray-50 transition-all">
              <GoogleIcon size={20} />
              <span>Tiếp tục với Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-[var(--border)] rounded-2xl font-bold text-[var(--text-h)] hover:bg-gray-50 transition-all">
              <FacebookIcon size={20} />
              <span>Tiếp tục với Facebook</span>
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-8">
            <div className="flex-grow h-px bg-[var(--border)]"></div>
            <span className="text-xs font-bold text-[var(--text)] uppercase tracking-widest">Hoặc</span>
            <div className="flex-grow h-px bg-[var(--border)]"></div>
          </div>

          <form className="space-y-5" onSubmit={handleAuthSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-[var(--text)] px-1">Họ và tên</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                    <input
                      type="text"
                      placeholder="Nhập họ tên của bạn"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text)] px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-[var(--text)]">Mật khẩu</label>
                {isLogin && (
                  <button type="button" className="text-sm font-bold text-[var(--accent)] hover:underline">Quên mật khẩu?</button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-[var(--border)] rounded-2xl focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all"
                />
              </div>
            </div>

            <button className="w-full py-4 bg-[var(--accent)] rounded-2xl font-bold text-lg shadow-xl shadow-[var(--accent)]/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group border">
              <span>{isLogin ? 'Đăng nhập' : 'Đăng ký ngay'}</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[var(--text)]">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-bold text-[var(--accent)] hover:underline"
              >
                {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập ngay'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
