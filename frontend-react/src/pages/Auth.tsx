import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Rocket, ArrowRight, Shield, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

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
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           
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
              <p className="text-white/80 text-lg leading-relaxed mb-8">
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

           <div className="flex items-center gap-4 text-sm text-white/60 relative z-10">
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
               <Search size={20} className="text-blue-500" />
               <span>Tiếp tục với Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-[var(--border)] rounded-2xl font-bold text-[var(--text-h)] hover:bg-gray-50 transition-all">
               <Shield size={20} />
               <span>Tiếp tục với Email khác</span>
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-8">
             <div className="flex-grow h-px bg-[var(--border)]"></div>
             <span className="text-xs font-bold text-[var(--text)] uppercase tracking-widest">Hoặc</span>
             <div className="flex-grow h-px bg-[var(--border)]"></div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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

            <button className="w-full py-4 bg-[var(--accent)] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[var(--accent)]/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
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
