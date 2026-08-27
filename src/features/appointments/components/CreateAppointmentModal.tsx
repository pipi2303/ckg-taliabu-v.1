import React, { useEffect, useState } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';
import { CareTask, HealthFacility, ServiceQuota } from '../../../types';
import { appointmentRepo } from '../../../repositories/appointmentRepo';
import { serviceQuotaRepo } from '../../../repositories/serviceQuotaRepo';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

interface CreateAppointmentModalProps {
  task?: CareTask | null;
  citizenId?: string;
  citizenName?: string;
  citizenNik?: string;
  citizenPhone?: string;
  initialFacilityId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  task,
  citizenId: propCitizenId,
  citizenName: propCitizenName,
  citizenNik: propCitizenNik,
  citizenPhone: propCitizenPhone,
  initialFacilityId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Pemeriksaan Klinis CKG & Konfirmasi');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('08:30 - 10:00 WIT');
  const [notes, setNotes] = useState<string>('');

  const [currentQuota, setCurrentQuota] = useState<ServiceQuota | null>(null);
  const [alternativeDates, setAlternativeDates] = useState<ServiceQuota[]>([]);
  const [isCheckingQuota, setIsCheckingQuota] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddingWaitlist, setIsAddingWaitlist] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveCitizenId = task?.citizenId || propCitizenId || '';
  const effectiveCitizenName = task?.citizenName || propCitizenName || 'Warga CKG';
  const effectiveCitizenNik = task?.citizenNik || propCitizenNik || '';
  const effectiveCitizenPhone = task?.citizenPhone || propCitizenPhone || '';

  useEffect(() => {
    if (isOpen) {
      loadFacilities();
      const facId = task?.facilityId || initialFacilityId || 'FASKES-PKM-01';
      setSelectedFacilityId(facId);
      
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      setScheduledDate(tomorrowStr);
      setNotes('');
      setError(null);
    }
  }, [isOpen, task, initialFacilityId]);

  useEffect(() => {
    if (selectedFacilityId && scheduledDate && serviceType) {
      checkQuota();
    }
  }, [selectedFacilityId, scheduledDate, serviceType]);

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

  const loadFacilities = async () => {
    try {
      const list = await facilityRepo.getAll();
      setFacilities(list.filter((f) => f.status === 'ACTIVE'));
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
  };

  const checkQuota = async () => {
    setIsCheckingQuota(true);
    try {
      const quota = await serviceQuotaRepo.getByFacilityAndDate(selectedFacilityId, scheduledDate, serviceType);
      setCurrentQuota(quota);

      if (!quota || quota.bookedCount >= quota.capacity) {
        // Find alternative available dates
        const allQuotas = await serviceQuotaRepo.getAvailableDates(selectedFacilityId, serviceType);
        const avail = allQuotas.filter((q) => q.date !== scheduledDate && q.bookedCount < q.capacity);
        setAlternativeDates(avail.slice(0, 3));
      } else {
        setAlternativeDates([]);
      }
    } catch (err) {
      console.error('Error checking quota:', err);
    } finally {
      setIsCheckingQuota(false);
    }
  };

  if (!isOpen) return null;

  const isFull = currentQuota && currentQuota.bookedCount >= currentQuota.capacity;
  const noQuotaConfigured = !currentQuota;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !effectiveCitizenId) return;

    if (isFull) {
      setError('Slot jadwal telah penuh. Sistem menolak overbooking. Silakan pilih tanggal alternatif atau masukkan ke Daftar Tunggu.');
      return;
    }

    if (noQuotaConfigured) {
      setError(`Tidak ditemukan kuota layanan untuk tanggal ${scheduledDate}. Harap atur kuota terlebih dahulu.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await appointmentRepo.create(
        {
          citizenId: effectiveCitizenId,
          citizenName: effectiveCitizenName,
          citizenNik: effectiveCitizenNik,
          citizenPhone: effectiveCitizenPhone,
          taskId: task?.id,
          facilityId: selectedFacilityId,
          facilityName: facilities.find((f) => f.id === selectedFacilityId)?.name || 'Puskesmas',
          serviceType,
          scheduledDate,
          scheduledTime,
          source: 'PUSKESMAS',
          notes,
        },
        { id: currentUser.id, name: currentUser.name }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat janji temu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToWaitlist = async () => {
    if (!currentUser || !effectiveCitizenId) return;
    setIsAddingWaitlist(true);
    setError(null);

    try {
      await appointmentRepo.addToWaitlist(
        {
          citizenId: effectiveCitizenId,
          citizenName: effectiveCitizenName,
          facilityId: selectedFacilityId,
          serviceType,
          priorityScore: task?.priorityScore || 50,
          isCritical: !!task?.isCritical,
          requestedDate: scheduledDate,
          taskId: task?.id,
        },
        { id: currentUser.id, name: currentUser.name }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan ke daftar tunggu.');
    } finally {
      setIsAddingWaitlist(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#D8E5E2] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Buat Janji Temu Terjadwal</h3>
              <p className="text-xs text-slate-300">{effectiveCitizenName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Facility & Service */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                Fasilitas Kesehatan
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                Jenis Layanan
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
              >
                <option value="Pemeriksaan Klinis CKG & Konfirmasi">Pemeriksaan Klinis CKG & Konfirmasi</option>
                <option value="Konsultasi Dokter FPKTP">Konsultasi Dokter FPKTP</option>
                <option value="Pemeriksaan Lab Gula Darah & Profil Lipid">Laboratorium (GDP/Lipid)</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                Tanggal Janji Temu <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
                Waktu Pelayanan
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg bg-white"
              >
                <option value="08:30 - 10:00 WIT">08:30 - 10:00 WIT (Pagi)</option>
                <option value="10:00 - 11:30 WIT">10:00 - 11:30 WIT (Siang)</option>
                <option value="13:00 - 14:30 WIT">13:00 - 14:30 WIT (Siang/Sore)</option>
              </select>
            </div>
          </div>

          {/* Quota & Capacity Status Box */}
          <div className="p-3.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-black flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#2E7D5B]" />
                Kapasitas Kuota Layanan
              </span>
              {isCheckingQuota ? (
                <span className="text-[11px] text-[#60716D]">Memeriksa...</span>
              ) : currentQuota ? (
                <span
                  className={`font-bold px-2 py-0.5 rounded text-xs ${
                    isFull
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentQuota.bookedCount} / {currentQuota.capacity} Terisi {isFull && '(PENUH)'}
                </span>
              ) : (
                <span className="text-xs text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                  Belum Diatur
                </span>
              )}
            </div>

            {/* If Slot is Full: Show Alternative Slots + Waitlist */}
            {isFull && (
              <div className="mt-3 pt-3 border-t border-[#D8E5E2] space-y-2.5">
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-200 text-xs text-red-900">
                  <strong>Slot Penuh:</strong> Kapasitas layanan pada tanggal ini telah mencapai batas maksimal ({currentQuota?.capacity} kuota). Sistem menerapkan aturan keras <em>Strict Anti-Overbooking</em>.
                </div>

                {alternativeDates.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#60716D] uppercase block mb-1.5">
                      Rekomendasi Tanggal Alternatif Terdekat:
                    </span>
                    <div className="space-y-1.5">
                      {alternativeDates.map((alt) => (
                        <div
                          key={alt.id}
                          onClick={() => setScheduledDate(alt.date)}
                          className="p-2 rounded-lg bg-white border border-[#D8E5E2] hover:border-[#00201C] cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <span className="font-semibold text-black">
                            {new Date(alt.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold text-[11px]">
                              Sisa {alt.capacity - alt.bookedCount} slot
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#60716D]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleAddToWaitlist}
                    disabled={isAddingWaitlist}
                    className="w-full bg-[#FFFACD] border-amber-300 text-amber-900 hover:bg-amber-100 text-xs"
                  >
                    {isAddingWaitlist ? 'Memproses...' : 'Daftarkan ke Antrean Daftar Tunggu Berprioritas'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#60716D] mb-1">
              Catatan Persiapan untuk Warga
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Harap puasa 8-10 jam sebelum pemeriksaan laboratorium..."
              className="w-full text-xs p-2 border border-[#D8E5E2] rounded-lg"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isFull || noQuotaConfigured || isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Janji Temu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
