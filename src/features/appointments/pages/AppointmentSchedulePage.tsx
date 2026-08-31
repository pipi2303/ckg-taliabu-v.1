import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Sliders,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Building2,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { Appointment, HealthFacility, ServiceQuota, WaitlistEntry } from '../../../types';
import { appointmentRepo } from '../../../repositories/appointmentRepo';
import { serviceQuotaRepo } from '../../../repositories/serviceQuotaRepo';
import { facilityRepo } from '../../../repositories/facilityRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';
import { DocBadge } from '../../../components/common/DocBadge';
import { CreateAppointmentModal } from '../components/CreateAppointmentModal';
import { RescheduleAppointmentModal } from '../components/RescheduleAppointmentModal';
import { ServiceQuotaModal } from '../components/ServiceQuotaModal';

export const AppointmentSchedulePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotas, setQuotas] = useState<ServiceQuota[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedQuota, setSelectedQuota] = useState<ServiceQuota | null>(null);

  useEffect(() => {
    loadReference();
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      loadData();
    }
  }, [selectedFacilityId, selectedDate]);

  const loadReference = async () => {
    const facs = await facilityRepo.getAll();
    setFacilities(facs);
    if (facs.length > 0 && facs[0]?.id) {
      setSelectedFacilityId(facs[0].id);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const apts = await appointmentRepo.query({
        facilityId: selectedFacilityId,
        date: selectedDate || undefined,
      });
      setAppointments(apts);

      const allQuotas = await serviceQuotaRepo.getAll();
      setQuotas(allQuotas.filter((q) => q.facilityId === selectedFacilityId));

      const wl = await appointmentRepo.getWaitlist(selectedFacilityId);
      setWaitlist(wl);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (apt: Appointment) => {
    const reason = prompt('Masukkan alasan pembatalan janji temu:');
    if (!reason || reason.trim().length < 5) return;

    if (!currentUser) return;
    try {
      await appointmentRepo.cancel(apt.id, reason, {
        id: currentUser.id,
        name: currentUser.name,
      });
      loadData();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const currentDayQuota = quotas.find((q) => q.date === selectedDate);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <CalendarIcon className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-black tracking-tight">Jadwal & Kuota Layanan Faskes</h1>
                <DocBadge code="SCR-PKM-G01" size="xs" />
              </div>
              <p className="text-xs text-[#60716D]">
                Manajemen kapasitas pelayanan, alokasi janji temu anti-overbooking, dan antrean prioritas tunggu.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedQuota(null);
              setIsQuotaModalOpen(true);
            }}
            leftIcon={<Sliders className="w-3.5 h-3.5" />}
          >
            Atur Kuota Layanan
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Buat Janji Temu
          </Button>
        </div>
      </div>

      {/* Facility & Date Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#60716D]" />
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="text-xs p-2 border border-[#D8E5E2] rounded-xl bg-white font-semibold"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#60716D]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs p-2 border border-[#D8E5E2] rounded-xl bg-white"
            />
          </div>
        </div>

        {/* Current Date Quota Utilization Badge */}
        {currentDayQuota ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#60716D] block">Kapasitas Slot Hari Ini</span>
              <span className="text-xs font-bold text-black">
                {currentDayQuota.bookedCount} / {currentDayQuota.capacity} Terisi
              </span>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                currentDayQuota.bookedCount >= currentDayQuota.capacity ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        ) : (
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            Kuota tanggal ini belum diatur.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Appointments on selected date */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
              <span className="font-bold text-xs">
                Janji Temu ({appointments.length} Pasien Terdaftar)
              </span>
              <span className="text-xs text-slate-300 font-mono">{selectedDate}</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-[#60716D]">Memuat jadwal...</div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#60716D]">
                Belum ada janji temu terdaftar untuk tanggal ini.
              </div>
            ) : (
              <div className="divide-y divide-[#D8E5E2]">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 transition-colors hover:bg-[#F8FBFA] flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black">{apt.citizenName}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {apt.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'ATTENDED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#334643] font-medium">{apt.serviceType}</div>

                      <div className="flex items-center gap-4 text-[11px] text-[#60716D]">
                        <span>Sesi: <strong>{apt.scheduledTime}</strong></span>
                        {apt.citizenPhone && <span>No. Telp: {apt.citizenPhone}</span>}
                      </div>

                      {apt.rescheduleReason && (
                        <div className="text-[10px] text-amber-800 italic bg-amber-50 p-1.5 rounded">
                          Jadwal ulang: {apt.rescheduleReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setIsRescheduleModalOpen(true);
                        }}
                        disabled={apt.status === 'CANCELLED' || apt.status === 'ATTENDED'}
                      >
                        Jadwal Ulang
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(apt)}
                        disabled={apt.status === 'CANCELLED' || apt.status === 'ATTENDED'}
                        className="text-red-700 hover:bg-red-50 border-red-200"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Priority Waitlist */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Antrean Daftar Tunggu (Waitlist)
              </span>
              <span className="text-xs font-mono text-emerald-300">{waitlist.length} Warga</span>
            </div>

            {waitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#60716D]">
                Tidak ada warga dalam antrean daftar tunggu saat ini.
              </div>
            ) : (
              <div className="divide-y divide-[#D8E5E2]">
                {waitlist.map((wl, idx) => (
                  <div key={wl.id} className="p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-black font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-black">{wl.citizenName}</span>
                      </div>
                      {wl.isCritical && (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                          KRITIS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#60716D]">
                      <span>Minta Tgl: {wl.requestedDate}</span>
                      <span className="font-semibold text-black">Skor: {wl.priorityScore}/100</span>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="text-[11px] py-1 px-2 h-auto text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                      >
                        Alokasikan Slot Baru
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAppointmentModal
        initialFacilityId={selectedFacilityId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadData}
      />

      <RescheduleAppointmentModal
        appointment={selectedAppointment}
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSuccess={loadData}
      />

      <ServiceQuotaModal
        quota={selectedQuota}
        facilityId={selectedFacilityId}
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
