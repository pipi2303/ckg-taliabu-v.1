import React, { useEffect, useState } from 'react';
import { X, Calendar, AlertTriangle } from 'lucide-react';
import { Appointment } from '../../../types';
import { appointmentRepo } from '../../../repositories/appointmentRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface RescheduleAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('08:30 - 10:00 WIT');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && appointment) {
      setNewDate('');
      setNewTime(appointment.scheduledTime || '08:30 - 10:00 WIT');
      setReason('');
      setError(null);
    }
  }, [isOpen, appointment]);

  // ESC Key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newDate) {
      setError('Pilih tanggal baru untuk jadwal ulang.');
      return;
    }

    if (!reason || reason.trim().length < 5) {
      setError('Alasan penjadwalan ulang wajib diisi minimal 5 karakter.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await appointmentRepo.reschedule(appointment.id, newDate, newTime, reason, {
        id: currentUser.id,
        name: currentUser.name,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menjadwalkan ulang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Jadwalkan Ulang Janji Temu</h3>
              <p className="text-xs text-slate-300">{appointment.citizenName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] text-xs space-y-1">
            <div className="text-[#60716D]">Jadwal Saat Ini:</div>
            <div className="font-bold text-black">
              {appointment.scheduledDate} ({appointment.scheduledTime})
            </div>
            <div className="text-[#60716D]">{appointment.facilityName}</div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Tanggal Baru <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Sesi Waktu
            </label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
            >
              <option value="08:30 - 10:00 WIT">08:30 - 10:00 WIT (Pagi)</option>
              <option value="10:00 - 11:30 WIT">10:00 - 11:30 WIT (Siang)</option>
              <option value="13:00 - 14:30 WIT">13:00 - 14:30 WIT (Siang/Sore)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Alasan Penjadwalan Ulang <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Warga berhalangan hadir karena kendala cuaca penyeberangan kapal..."
              rows={2}
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg focus:outline-none focus:border-[#00201C]"
              required
            />
          </div>

          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal Baru'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
