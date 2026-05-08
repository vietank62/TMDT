const ProfileTab = () => (
  <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
    <h2 className="text-2xl font-bold text-[var(--text-h)] mb-8">Thông tin cá nhân</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-2">
        <label htmlFor="profile-name" className="text-sm font-bold text-[var(--text)]">
          Họ và tên
        </label>
        <input
          id="profile-name"
          type="text"
          defaultValue="Lê Minh Tuấn"
          className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="profile-email" className="text-sm font-bold text-[var(--text)]">
          Email
        </label>
        <input
          id="profile-email"
          type="email"
          defaultValue="tuan.le@example.com"
          className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="profile-phone" className="text-sm font-bold text-[var(--text)]">
          Số điện thoại
        </label>
        <input
          id="profile-phone"
          type="text"
          defaultValue="0987654321"
          className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="profile-category" className="text-sm font-bold text-[var(--text)]">
          Lĩnh vực quan tâm
        </label>
        <select
          id="profile-category"
          className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--accent)] outline-none"
        >
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
);

export default ProfileTab;
