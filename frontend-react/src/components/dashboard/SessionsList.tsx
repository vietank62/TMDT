import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Info,
  Pencil,
  FileText,
  Paperclip,
  Trash2,
  Upload,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SessionDocument {
  name: string;
  url?: string;
}

export interface UpcomingSession {
  id: number;
  expert: string;
  date: string;
  time: string;
  problem?: string;
  documents?: SessionDocument[];
}

export interface PastSession {
  id: number;
  expert: string;
  date: string;
  time: string;
  status: string;
}

interface SessionsListProps {
  sessionLabel: string;
  historyTitle: string;
  expertColumnLabel?: string;
  upcomingSessions: UpcomingSession[];
  pastSessions: PastSession[];
  allowEdit?: boolean;
}

// ── EditModal ──────────────────────────────────────────────────────────────────
function EditModal({
  draftProblem,
  draftDocuments,
  onProblemChange,
  onRemoveDocument,
  onAddFiles,
  onSave,
  onClose,
}: Readonly<{
  draftProblem: string;
  draftDocuments: SessionDocument[];
  onProblemChange: (v: string) => void;
  onRemoveDocument: (i: number) => void;
  onAddFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onClose: () => void;
}>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Pencil size={18} className="text-[var(--accent)]" />
            <h3 className="font-bold text-lg text-[var(--text-h)]">Chỉnh sửa thông tin</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text)] hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Problem */}
          <div className="space-y-2">
            <label htmlFor="edit-problem" className="flex items-center gap-2 text-sm font-bold text-[var(--text-h)]">
              <FileText size={15} className="text-[var(--accent)]" />
              Vấn đề cần tư vấn
            </label>
            <textarea
              id="edit-problem"
              value={draftProblem}
              onChange={(e) => onProblemChange(e.target.value)}
              placeholder="Mô tả vấn đề bạn cần tư vấn..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--accent)] outline-none resize-none transition-all"
            />
          </div>

          {/* Documents */}
          <div className="space-y-3">
            <span className="flex items-center gap-2 text-sm font-bold text-[var(--text-h)]">
              <Paperclip size={15} className="text-[var(--accent)]" />
              Tài liệu liên quan
            </span>

            {draftDocuments.length > 0 && (
              <ul className="space-y-2">
                {draftDocuments.map((doc, i) => (
                  <li
                    key={`${doc.name}-${i}`}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 border border-[var(--border)] rounded-xl"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="text-sm text-[var(--text-h)] truncate">{doc.name}</span>
                    </div>
                    <button
                      onClick={() => onRemoveDocument(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Xóa tài liệu"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Upload trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[var(--accent)] text-[var(--accent)] rounded-2xl text-sm font-bold hover:bg-[var(--accent-bg)] transition-colors"
            >
              <Upload size={16} />
              <span>Tải lên tài liệu</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onAddFiles}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--text)] hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--accent)] hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
          >
            Lưu thay đổi
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── SessionCard ────────────────────────────────────────────────────────────────
function SessionCard({
  session,
  sessionLabel,
  allowEdit = false,
}: Readonly<{ session: UpcomingSession; sessionLabel: string; allowEdit?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Local editable copies — changes persist within the session until page reload
  const [problem, setProblem] = useState(session.problem ?? '');
  const [documents, setDocuments] = useState<SessionDocument[]>(session.documents ?? []);

  // Draft copies used only while the modal is open
  const [draftProblem, setDraftProblem] = useState('');
  const [draftDocuments, setDraftDocuments] = useState<SessionDocument[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  const openEdit = () => {
    setDraftProblem(problem);
    setDraftDocuments([...documents]);
    setIsOpen(false);
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    setProblem(draftProblem);
    setDocuments(draftDocuments);
    setIsEditOpen(false);
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newDocs: SessionDocument[] = Array.from(files).map((f) => ({ name: f.name }));
    setDraftDocuments((prev) => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const removeDocument = (index: number) => {
    setDraftDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
      >
        {/* Session info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[var(--accent-bg)] rounded-2xl flex items-center justify-center text-[var(--accent)] shrink-0">
            <Video size={28} />
          </div>
          <div>
            <h4 className="font-bold text-lg text-[var(--text-h)]">
              {sessionLabel} {session.expert}
            </h4>
            <div className="flex flex-wrap gap-4 text-sm text-[var(--text)] mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {session.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {session.time}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/call/session-${session.id}`}
            className="flex-grow md:flex-grow-0 px-6 py-3 bg-[var(--accent)] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-[var(--accent)]/20 transition-all"
          >
            <span>Tham gia ngay</span>
            <Video size={16} />
          </Link>

          {/* Details dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen((v) => !v)}
              title="Chi tiết"
              className={`p-3 rounded-xl transition-colors ${
                isOpen
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'bg-gray-50 text-[var(--text)] hover:bg-gray-100'
              }`}
            >
              <Info size={20} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-[var(--border)] shadow-xl z-20 overflow-hidden"
                >
                  {/* Dropdown header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-gray-50">
                    <span className="text-xs font-bold text-[var(--text-h)] uppercase tracking-wide">
                      Chi tiết
                    </span>
                    {allowEdit && (
                      <button
                        onClick={openEdit}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </div>

                  {/* Problem */}
                  <div className="px-5 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="text-xs font-bold text-[var(--text-h)] uppercase tracking-wide">
                        Vấn đề cần tư vấn
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text)] leading-relaxed">
                      {problem.trim() ? problem : 'Chưa có mô tả.'}
                    </p>
                  </div>

                  {/* Documents */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip size={14} className="text-[var(--accent)] shrink-0" />
                      <span className="text-xs font-bold text-[var(--text-h)] uppercase tracking-wide">
                        Tài liệu liên quan
                      </span>
                    </div>

                    {documents.length > 0 ? (
                      <ul className="space-y-2">
                        {documents.map((doc) => (
                          <li key={doc.name}>
                            {doc.url ? (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline font-medium"
                              >
                                <FileText size={14} className="shrink-0" />
                                <span className="truncate">{doc.name}</span>
                              </a>
                            ) : (
                              <span className="flex items-center gap-2 text-sm text-[var(--text)]">
                                <FileText size={14} className="shrink-0 opacity-50" />
                                <span className="truncate">{doc.name}</span>
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[var(--text)] opacity-60 italic">
                        Không có tài liệu đính kèm.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Edit modal — only available when editing is permitted */}
      <AnimatePresence>
        {allowEdit && isEditOpen && (
          <EditModal
            draftProblem={draftProblem}
            draftDocuments={draftDocuments}
            onProblemChange={setDraftProblem}
            onRemoveDocument={removeDocument}
            onAddFiles={handleAddFiles}
            onSave={saveEdit}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── SessionsList ───────────────────────────────────────────────────────────────
const SessionsList = ({
  sessionLabel,
  historyTitle,
  expertColumnLabel = 'Chuyên gia',
  upcomingSessions,
  pastSessions,
  allowEdit = false,
}: Readonly<SessionsListProps>) => (
  <div className="space-y-8">
    {/* Upcoming */}
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-h)]">Lịch sắp tới</h2>
        <span className="px-3 py-1 bg-[var(--accent-bg)] text-[var(--accent)] text-xs font-bold rounded-full self-start sm:self-auto">
          {upcomingSessions.length} phiên
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {upcomingSessions.map((session) => (
          <SessionCard key={session.id} session={session} sessionLabel={sessionLabel} allowEdit={allowEdit} />
        ))}
      </div>
    </section>

    {/* History */}
    <section>
      <h2 className="text-2xl font-bold text-[var(--text-h)] mb-6">{historyTitle}</h2>
      <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-[var(--text)] uppercase tracking-wider">{expertColumnLabel}</th>
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
                <td className="px-6 py-4 text-sm text-[var(--accent)] font-bold cursor-pointer hover:underline">
                  Xem đánh giá
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </div>
);

export default SessionsList;
