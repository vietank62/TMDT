export const EXPERT_CATEGORIES = [
  { value: 'technology', label: 'Công nghệ' },
  { value: 'business', label: 'Kinh doanh' },
  { value: 'finance', label: 'Tài chính' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Thiết kế' },
  { value: 'legal', label: 'Pháp lý' },
  { value: 'healthcare', label: 'Y tế' },
  { value: 'education', label: 'Giáo dục' },
  { value: 'career', label: 'Phát triển nghề nghiệp' },
  { value: 'startup', label: 'Khởi nghiệp' },
]

export const SORT_OPTIONS = [
  { value: 'rating_desc', label: 'Đánh giá cao nhất' },
  { value: 'price_asc', label: 'Giá thấp nhất' },
  { value: 'price_desc', label: 'Giá cao nhất' },
  { value: 'experience_desc', label: 'Nhiều kinh nghiệm nhất' },
  { value: 'sessions_desc', label: 'Nhiều phiên tư vấn nhất' },
]

export const PRICE_RANGES = [
  { value: '0-500000', label: 'Dưới 500.000đ' },
  { value: '500000-1000000', label: '500.000đ - 1.000.000đ' },
  { value: '1000000-2000000', label: '1.000.000đ - 2.000.000đ' },
  { value: '2000000+', label: 'Trên 2.000.000đ' },
]

export const RATING_OPTIONS = [
  { value: '4.5', label: '4.5 sao trở lên' },
  { value: '4.0', label: '4.0 sao trở lên' },
  { value: '3.5', label: '3.5 sao trở lên' },
]

export const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
  { value: 'ja', label: 'Tiếng Nhật' },
  { value: 'ko', label: 'Tiếng Hàn' },
]

export const SESSION_DURATIONS = [
  { value: 30, label: '30 phút' },
  { value: 60, label: '60 phút' },
  { value: 90, label: '90 phút' },
]

export const NAV_LINKS = [
  { href: '/experts', label: 'Chuyên gia' },
  { href: '/about', label: 'Về chúng tôi' },
]

export const DASHBOARD_NAV = [
  { href: '/dashboard/consultations', label: 'Phiên tư vấn', icon: 'Calendar' },
  { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: 'User' },
  { href: '/dashboard/payments', label: 'Lịch sử thanh toán', icon: 'CreditCard' },
  { href: '/dashboard/notifications', label: 'Thông báo', icon: 'Bell' },
  { href: '/dashboard/become-expert', label: 'Đăng ký chuyên gia', icon: 'Star' },
]

export const EXPERT_NAV = [
  { href: '/expert/profile', label: 'Hồ sơ chuyên gia', icon: 'User' },
  { href: '/expert/availability', label: 'Lịch rảnh', icon: 'CalendarDays' },
  { href: '/expert/requests', label: 'Yêu cầu chờ duyệt', icon: 'Clock' },
  { href: '/expert/sessions', label: 'Phiên sắp tới', icon: 'Video' },
  { href: '/expert/history', label: 'Lịch sử tư vấn', icon: 'History' },
  { href: '/expert/earnings', label: 'Doanh thu', icon: 'TrendingUp' },
  { href: '/expert/reviews', label: 'Đánh giá', icon: 'Star' },
]

export const ADMIN_NAV = [
  { href: '/admin', label: 'Tổng quan', icon: 'LayoutDashboard' },
  { href: '/admin/users', label: 'Người dùng', icon: 'Users' },
  { href: '/admin/experts', label: 'Chuyên gia', icon: 'UserCheck' },
  { href: '/admin/applications', label: 'Hồ sơ chờ duyệt', icon: 'FileText' },
  { href: '/admin/bookings', label: 'Phiên tư vấn', icon: 'Calendar' },
  { href: '/admin/payments', label: 'Thanh toán', icon: 'CreditCard' },
  { href: '/admin/refunds', label: 'Hoàn tiền', icon: 'RefreshCw' },
  { href: '/admin/reviews', label: 'Đánh giá', icon: 'Star' },
  { href: '/admin/analytics', label: 'Báo cáo', icon: 'BarChart3' },
]

export const MOCK_BANK_ACCOUNT = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'CONG TY MICROMENTOR',
}
