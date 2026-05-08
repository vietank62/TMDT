import { Link } from 'react-router-dom';
import { Rocket, Globe, Share2, Info, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--border)] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center">
                <Rocket size={24} />
              </div>
              <span className="text-2xl font-bold text-[var(--text-h)]">
                Micro<span className="text-[var(--accent)]">Mentor</span>
              </span>
            </Link>
            <p className="text-[var(--text)] leading-relaxed">
              Sứ mệnh của chúng tôi là dân chủ hóa tri thức, kết nối bạn với những bộ óc xuất chúng nhất để cùng nhau bứt phá.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 bg-[var(--social-bg)] rounded-full text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="p-2 bg-[var(--social-bg)] rounded-full text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                <Share2 size={20} />
              </a>
              <a href="#" className="p-2 bg-[var(--social-bg)] rounded-full text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                <Info size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold text-[var(--text-h)] mb-6">Nền tảng</h4>
            <ul className="space-y-4 text-[var(--text)]">
              <li><Link to="/" className="hover:text-[var(--accent)] transition-colors">Khám phá Chuyên gia</Link></li>
              <li><Link to="/experts" className="hover:text-[var(--accent)] transition-colors">Trở thành Chuyên gia</Link></li>
              <li><Link to="/pricing" className="hover:text-[var(--accent)] transition-colors">Bảng giá</Link></li>
              <li><Link to="/faq" className="hover:text-[var(--accent)] transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-bold text-[var(--text-h)] mb-6">Công ty</h4>
            <ul className="space-y-4 text-[var(--text)]">
              <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/careers" className="hover:text-[var(--accent)] transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/blog" className="hover:text-[var(--accent)] transition-colors">Blog & Tin tức</Link></li>
              <li><Link to="/privacy" className="hover:text-[var(--accent)] transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold text-[var(--text-h)] mb-6">Đăng ký nhận tin</h4>
            <p className="text-sm text-[var(--text)] mb-4">Nhận thông tin mới nhất về các phiên tư vấn và sự kiện.</p>
            <div className="relative">
              <Mail className="absolute left-3 top-6 -translate-y-1/2 text-[var(--text)] opacity-40" size={18} />
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full bg-[var(--social-bg)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all outline-none"
              />
              <button className="w-full mt-3 bg-[var(--text-h)] py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text)]">
          <p>© 2026 MicroMentor System. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
