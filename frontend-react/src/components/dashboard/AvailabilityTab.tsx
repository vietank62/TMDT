import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
} from 'lucide-react';

// Booked slots are read-only — they cannot be removed
const BOOKED_SLOTS = new Set(['09:15', '10:30']);

const TODAY = new Date().toISOString().split('T')[0];

const sortStrings = (arr: string[]) => [...arr].sort((a, b) => a.localeCompare(b));

const AvailabilityTab = () => {
  // ── Core data (mutable) ──────────────────────────────────────────────────
  const [dates, setDates] = useState(['2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13']);
  const [slots, setSlots] = useState(['09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45']);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [expandedSection, setExpandedSection] = useState<'date' | 'time' | null>(null);

  // Add-date inline form
  const [showDateInput, setShowDateInput] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Add-slot inline form
  const [showSlotInput, setShowSlotInput] = useState(false);
  const [newSlot, setNewSlot] = useState('');
  const [slotError, setSlotError] = useState('');

  // ── Handlers: dates ──────────────────────────────────────────────────────
  const handleAddDate = () => {
    if (!newDate) { setDateError('Vui lòng chọn ngày'); return; }
    if (dates.includes(newDate)) { setDateError('Ngày đã tồn tại'); return; }
    const updated = sortStrings([...dates, newDate]);
    setDates(updated);
    setSelectedDate(newDate);
    setNewDate('');
    setDateError('');
    setShowDateInput(false);
    setExpandedSection('time');
  };

  const cancelDateInput = () => {
    setNewDate('');
    setDateError('');
    setShowDateInput(false);
  };

  const handleRemoveDate = (date: string) => {
    const updated = dates.filter((d) => d !== date);
    setDates(updated);
    if (date === selectedDate) {
      setSelectedDate(updated[0] ?? '');
    }
  };

  // ── Handlers: slots ──────────────────────────────────────────────────────
  const handleAddSlot = () => {
    if (!newSlot) { setSlotError('Vui lòng chọn giờ'); return; }
    const [, mm] = newSlot.split(':').map(Number);
    if (mm % 15 !== 0) { setSlotError('Chỉ được chọn khung giờ 15 phút'); return; }
    if (slots.includes(newSlot)) { setSlotError('Khung giờ đã tồn tại'); return; }
    setSlots(sortStrings([...slots, newSlot]));
    setNewSlot('');
    setSlotError('');
    setShowSlotInput(false);
  };

  const cancelSlotInput = () => {
    setNewSlot('');
    setSlotError('');
    setShowSlotInput(false);
  };

  const handleRemoveSlot = (slot: string) => {
    setSlots((prev) => prev.filter((s) => s !== slot));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold text-[var(--text-h)]">Quản lý khung giờ rảnh</h2>

      <div className="grid grid-cols-1 gap-6">
        {/* ── Date panel ── */}
        <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === 'date' ? null : 'date')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl">
                <Calendar size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[var(--text-h)]">Chọn ngày quản lý</h3>
                <p className="text-sm text-[var(--text)]">{selectedDate || 'Chưa có ngày'}</p>
              </div>
            </div>
            {expandedSection === 'date' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <AnimatePresence>
            {expandedSection === 'date' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-[var(--border)]"
              >
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dates.map((date) => (
                    <div key={date} className="relative group">
                      <button
                        onClick={() => {
                          setSelectedDate(date);
                          setExpandedSection('time');
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          selectedDate === date
                            ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg'
                            : 'bg-gray-50 border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]'
                        }`}
                      >
                        <span className="font-bold">{date}</span>
                        <CheckCircle2
                          size={18}
                          className={selectedDate === date ? 'text-black' : 'text-green-500'}
                        />
                      </button>
                      {/* Remove date */}
                      <button
                        onClick={() => handleRemoveDate(date)}
                        title="Xóa ngày"
                        className="absolute -top-1.5 -right-1.5 p-1 bg-white border border-red-200 text-red-400 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add-date inline form */}
                  {showDateInput ? (
                    <div className="col-span-full flex flex-col gap-1">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-[var(--accent)] rounded-2xl">
                        <input
                          type="date"
                          value={newDate}
                          min={TODAY}
                          onChange={(e) => { setNewDate(e.target.value); setDateError(''); }}
                          className="flex-grow bg-transparent text-sm text-[var(--text-h)] outline-none"
                        />
                        <button
                          onClick={handleAddDate}
                          title="Xác nhận"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors shrink-0"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelDateInput}
                          title="Hủy"
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {dateError && (
                        <p className="text-xs text-red-500 px-1">{dateError}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDateInput(true)}
                      className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-all font-bold"
                    >
                      <Plus size={18} />
                      <span>Thêm ngày mới</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Time slot panel ── */}
        <div className="bg-white border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === 'time' ? null : 'time')}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl">
                <Clock size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[var(--text-h)]">Quản lý khung giờ</h3>
                <p className="text-sm text-[var(--text)]">Đang xem ngày {selectedDate || '—'}</p>
              </div>
            </div>
            {expandedSection === 'time' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <AnimatePresence>
            {expandedSection === 'time' && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden border-t border-[var(--border)]"
              >
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                    {slots.map((slot) => {
                      const isBooked = BOOKED_SLOTS.has(slot);
                      return (
                        <div
                          key={slot}
                          className={`flex items-center justify-between p-3 rounded-xl group border transition-all ${
                            isBooked
                              ? 'bg-green-50 border-green-100'
                              : 'bg-gray-50 border-[var(--border)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${isBooked ? 'text-green-700' : 'text-[var(--text-h)]'}`}>
                              {slot}
                            </span>
                            {isBooked && <CheckCircle2 size={14} className="text-green-500" />}
                          </div>
                          {!isBooked && (
                            <button
                              onClick={() => handleRemoveSlot(slot)}
                              title="Xóa khung giờ"
                              className="p-1 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add-slot inline form */}
                  {showSlotInput ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-[var(--accent)] rounded-2xl">
                        <input
                          type="time"
                          step="900"
                          value={newSlot}
                          onChange={(e) => { setNewSlot(e.target.value); setSlotError(''); }}
                          className="flex-grow bg-transparent text-sm text-[var(--text-h)] outline-none"
                        />
                        <button
                          onClick={handleAddSlot}
                          title="Xác nhận"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors shrink-0"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={cancelSlotInput}
                          title="Hủy"
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {slotError && (
                        <p className="text-xs text-red-500 px-1">{slotError}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSlotInput(true)}
                      className="w-full py-4 bg-[var(--accent-bg)] text-[var(--accent)] rounded-2xl font-bold hover:bg-[var(--accent)] hover:text-white transition-all flex items-center justify-center gap-2 border border-dashed border-[var(--accent)]"
                    >
                      <Plus size={20} />
                      <span>Thêm khung giờ (15p)</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AvailabilityTab;
