import { Calendar, Clock, User, CreditCard, LogOut, BookOpen, ChevronRight, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'sessions',      label: 'Lịch tư vấn',          icon: Calendar },
  { id: 'study',         label: 'Lịch học',              icon: BookOpen },
  { id: 'availability',  label: 'Quản lý lịch rảnh',    icon: Clock    },
  { id: 'profile',       label: 'Hồ sơ cá nhân',        icon: User     },
  { id: 'payments',      label: 'Lịch sử thanh toán',   icon: CreditCard },
];

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab, setActiveTab }: Readonly<DashboardSidebarProps>) => {
  const { user, logout } = useAuth();

  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Profile card */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm text-center mb-8">
        <div className="relative inline-block mb-4">
          <img
            src={user?.avatar ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&auto=format&fit=crop'}
            className="w-24 h-24 rounded-full object-cover border-4 border-[var(--accent-bg)]"
            alt="Avatar"
          />
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <h3 className="font-bold text-xl text-[var(--text-h)]">{user?.name ?? 'Người dùng'}</h3>
        <p className="text-sm text-[var(--text)]">Thành viên từ 2024</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-medium transition-all ${
              activeTab === item.id
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

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-medium text-red-500 hover:bg-red-50 transition-all mt-8"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
