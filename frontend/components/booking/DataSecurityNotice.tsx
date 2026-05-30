import { AlertTriangle, Eye, Lock, ShieldCheck, Users } from 'lucide-react'

const GUARANTEES = [
  {
    icon: Lock,
    text: 'Tệp được mã hóa trong quá trình tải lên và lưu trữ an toàn trên hệ thống.',
  },
  {
    icon: Users,
    text: 'Chỉ bạn và chuyên gia liên quan đến phiên tư vấn mới có quyền truy cập tài liệu.',
  },
  {
    icon: Eye,
    text: 'Tệp tải lên không được công khai — không ai ngoài cuộc hẹn có thể xem.',
  },
  {
    icon: ShieldCheck,
    text: 'Dữ liệu không được chia sẻ với bên thứ ba nếu không có sự đồng ý của bạn.',
  },
] as const

export default function DataSecurityNotice() {
  return (
    <div
      className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3"
      role="note"
      aria-label="Cam kết bảo mật dữ liệu"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" aria-hidden="true" />
        <h3 className="font-semibold text-green-800 text-sm">Cam Kết Bảo Mật Dữ Liệu</h3>
      </div>

      {/* Description */}
      <p className="text-xs text-green-700 leading-relaxed">
        MicroMentor cam kết bảo vệ toàn bộ tài liệu bạn tải lên trong quá trình tư vấn. Mọi tệp đều được xử lý theo tiêu chuẩn bảo mật cao nhất, đảm bảo quyền riêng tư và tính bảo mật của thông tin cá nhân.
      </p>

      {/* Guarantees list */}
      <ul className="space-y-2" role="list" aria-label="Các cam kết bảo mật">
        {GUARANTEES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2 text-xs text-green-700">
            <Icon className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2"
        role="note"
        aria-label="Lưu ý khi tải lên tài liệu"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Lưu ý: </span>
          Chỉ tải lên các tài liệu thực sự cần thiết cho buổi tư vấn. Không chia sẻ thông tin cá nhân nhạy cảm không liên quan. Hệ thống có quyền từ chối hoặc xóa các tệp độc hại hoặc vi phạm chính sách nền tảng.
        </p>
      </div>
    </div>
  )
}
