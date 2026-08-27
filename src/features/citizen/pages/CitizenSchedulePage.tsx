import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
  Phone,
  RefreshCw,
  Info,
  CalendarCheck,
  Building2,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { citizenAppointmentService, AvailableSlotInfo } from '../../../services/citizenAppointmentService';
import { citizenResponseService } from '../../../services/citizenResponseService';
import { BARRIER_REASON_LABELS } from '../../../services/citizenCopyDictionary';
import { DocBadge } from '../components/DocBadge';
import { SharedBarrierReason } from '../../../types';

export const CitizenSchedulePage: React.FC = () => {
  const { citizen, profile, isOnline, refreshProfile } = useCitizen();

  const [availableSlots, setAvailableSlots] = useState<AvailableSlotInfo[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('08:30 - 10:00 WIT');

  // Modals
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reschedule Barrier Form State
  const [selectedBarrier, setSelectedBarrier] = useState<SharedBarrierReason>('WORK_SCHEDULE');
  const [barrierNote, setBarrierNote] = useState('');
  const [cancelReason, setCancelReason] = useState('Jadwal belum memungkinkan');

  const facilityId = citizen?.facilityId || 'FASKES-PKM-01';

  // Load available quota slots
  const loadSlots = async () => {
    if (!isOnline) return;
    setIsLoadingSlots(true);
    try {
      const slots = await citizenAppointmentService.getAvailableSlots(facilityId);
      setAvailableSlots(slots);
      if (slots.length > 0) {
        const availableOne = slots.find((s) => s.isAvailable);
        setSelectedDate(availableOne ? availableOne.date : slots[0].date);
      }
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [facilityId, isOnline]);

  const appointment = profile?.appointment;
  const taskId = profile?.nextAction?.taskId;

  // Handle Attendance Confirmation
  const handleConfirmAttendance = async () => {
    if (!citizen || !appointment) return;
    setIsSubmitting(true);
    try {
      const res = await citizenResponseService.submitAttendanceResponse({
        citizenId: citizen.id,
        appointmentId: appointment.id,
        taskId,
        responseChoice: 'ATTENDING',
        channel: 'APP',
      });
      if (res.success) {
        setShowSuccessToast(res.message);
        await refreshProfile();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengonfirmasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reschedule
  const handleRescheduleSubmit = async () => {
    if (!citizen || !appointment || !selectedDate) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await citizenAppointmentService.rescheduleAppointment({
        appointmentId: appointment.id,
        citizenId: citizen.id,
        newDate: selectedDate,
        newTimeSlot: selectedTimeSlot,
        barrierReason: selectedBarrier,
        reasonDetail: barrierNote,
      });

      if (res.success) {
        setShowRescheduleModal(false);
        setShowSuccessToast(res.message);
        await refreshProfile();
        await loadSlots();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengubah jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Booking when no active appointment exists
  const handleBookNew = async () => {
    if (!citizen || !selectedDate) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await citizenAppointmentService.bookAppointment({
        citizenId: citizen.id,
        taskId,
        facilityId,
        scheduledDate: selectedDate,
        timeSlot: selectedTimeSlot,
      });

      if (res.success) {
        setShowSuccessToast(res.message);
        await refreshProfile();
        await loadSlots();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memilih jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Cancel
  const handleCancelSubmit = async () => {
    if (!citizen || !appointment) return;
    setIsSubmitting(true);
    try {
      const res = await citizenAppointmentService.cancelAppointment({
        appointmentId: appointment.id,
        citizenId: citizen.id,
        reason: cancelReason,
      });

      if (res.success) {
        setShowCancelModal(false);
        setShowSuccessToast(res.message);
        await refreshProfile();
        await loadSlots();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membatalkan jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Waitlist Submit
  const handleWaitlistSubmit = async () => {
    if (!citizen || !selectedDate) return;
    setIsSubmitting(true);
    try {
      const res = await citizenAppointmentService.registerToWaitlist({
        citizenId: citizen.id,
        facilityId,
        preferredDate: selectedDate,
        notes: barrierNote,
      });
      if (res.success) {
        setShowWaitlistModal(false);
        setShowSuccessToast(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftar antrean.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSlotData = availableSlots.find((s) => s.date === selectedDate);

  return (
    <div className="p-4 space-y-5">
      {/* Page Title & DocBadge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-black">Jadwal Pemeriksaan</h1>
          <p className="text-xs text-[#60716D] mt-0.5">
            Atur waktu kunjungan lanjutan yang nyaman dan sesuai bagi Anda
          </p>
        </div>

        <DocBadge
          code="SCR-WRG-C01"
          title="Pilih & Ubah Jadwal"
          phase="F1"
          plafon="S2"
          useCase="UC PSN-10, PSN-12"
          description="Slot kuota terintegrasi real-time dengan FKTP. Alasan perubahan jadwal memakai format baku CMP-07."
          rules={[
            'Slot kuota faskes real-time Puskesmas / Pustu.',
            'Alasan reschedule format baku CMP-07 (sinyal risiko dropout).',
            'Bahasa netral tanpa kesan menyalahkan warga.',
          ]}
          variant="blue"
          size="xs"
        />
      </div>

      {/* Success Toast Banner */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{showSuccessToast}</span>
          </div>
          <button
            onClick={() => setShowSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. ACTIVE APPOINTMENT CARD (IF EXISTS)                       */}
      {/* ============================================================ */}
      {appointment ? (
        <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E1F5FE] flex items-center justify-center text-black">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-black block">Janji Temu Aktif</span>
                <span className="text-[10px] text-[#60716D]">{appointment.serviceName}</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                appointment.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : appointment.status === 'RESCHEDULED'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {appointment.status === 'CONFIRMED'
                ? 'Terkonfirmasi'
                : appointment.status === 'RESCHEDULED'
                ? 'Jadwal Diubah'
                : appointment.status}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[11px]">Tanggal & Waktu</span>
                <strong className="text-black text-sm">
                  {appointment.scheduledDate} ({appointment.scheduledTimeSlot})
                </strong>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-black shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-500 block text-[11px]">Lokasi Fasilitas</span>
                <span className="font-semibold text-black">{appointment.facilityName}</span>
                <p className="text-[11px] text-gray-500">{appointment.facilityAddress}</p>
              </div>
            </div>

            {appointment.preparationNotes && appointment.preparationNotes.length > 0 && (
              <div className="bg-[#F8FBFA] p-3 rounded-xl border border-[#D8E5E2] space-y-1">
                <span className="text-[11px] font-bold text-black block">
                  Petunjuk Kunjungan:
                </span>
                <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                  {appointment.preparationNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            {appointment.status !== 'CONFIRMED' && (
              <button
                onClick={handleConfirmAttendance}
                disabled={isSubmitting || !isOnline}
                className="w-full py-3 bg-[#00201C] hover:bg-[#102521] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Saya Akan Datang Sesuai Jadwal
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowRescheduleModal(true)}
                disabled={!isOnline}
                className="flex-1 py-2.5 bg-[#E1F5FE] hover:bg-[#cbeefa] text-black text-xs font-semibold rounded-xl transition-colors text-center disabled:opacity-60"
              >
                Ubah Jadwal
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={!isOnline}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors text-center"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* 2. BOOK NEW APPOINTMENT (IF NO ACTIVE APPOINTMENT)           */
        /* ============================================================ */
        <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Pilih Tanggal Kunjungan</h2>
            <button
              onClick={loadSlots}
              disabled={isLoadingSlots || !isOnline}
              className="text-[11px] text-black flex items-center gap-1 font-semibold hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingSlots ? 'animate-spin' : ''}`} />
              Cek Kuota
            </button>
          </div>

          {/* Quota Slot Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Pilihan Hari Tersedia di Puskesmas:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedDate === slot.date;
                return (
                  <button
                    key={slot.date}
                    onClick={() => setSelectedDate(slot.date)}
                    disabled={!slot.isAvailable}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#00201C] bg-[#E1F5FE]/60 ring-2 ring-[#00201C]'
                        : slot.isAvailable
                        ? 'border-[#D8E5E2] bg-white hover:border-gray-400'
                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-xs text-black">
                          {slot.dayName}, {slot.date}
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5">
                          {slot.isAvailable ? (
                            <span className="text-emerald-700 font-medium">
                              Tersedia {slot.remainingSlots} slot
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">Jadwal Penuh</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Pilihan Sesi Pelayanan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['08:30 - 10:00 WIT', '10:00 - 11:30 WIT', '11:30 - 13:00 WIT'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTimeSlot(slot)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                    selectedTimeSlot === slot
                      ? 'bg-[#00201C] text-white border-[#00201C]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Slot capacity warning if full */}
          {selectedSlotData && !selectedSlotData.isAvailable && (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Jadwal tanggal ini sudah penuh
              </div>
              <p className="text-[11px] text-amber-900">
                Kapasitas pemeriksaan telah mencapai batas. Anda dapat memilih tanggal lain atau mendaftar ke Daftar Tunggu agar diprioritaskan jika ada pembatalan.
              </p>
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="w-full py-2 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold text-xs transition-colors"
              >
                Masuk Daftar Tunggu
              </button>
            </div>
          )}

          {/* Submit Booking */}
          <div className="pt-2">
            <button
              onClick={handleBookNew}
              disabled={isSubmitting || !isOnline || !selectedSlotData?.isAvailable}
              className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFFACD]" />
              Konfirmasi Pilihan Jadwal Ini
            </button>
          </div>
        </div>
      )}

      {/* Offline Notice if offline */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <strong>Catatan:</strong> Pengubahan jadwal memerlukan koneksi internet untuk memeriksa kuota faskes secara langsung.
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. RESCHEDULE MODAL (WITH BARRIER REASON SELECTION)          */}
      {/* ============================================================ */}
      {showRescheduleModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-black border border-[#D8E5E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8E5E2] bg-[#F8FBFA]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-black" />
                <h3 className="font-bold text-base text-black">Ubah Jadwal Kunjungan</h3>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 block">
                  Mohon pilih alasan perubahan jadwal:
                </label>
                <div className="space-y-1.5">
                  {(Object.keys(BARRIER_REASON_LABELS) as SharedBarrierReason[]).map((key) => {
                    const item = BARRIER_REASON_LABELS[key];
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          selectedBarrier === key
                            ? 'bg-[#E1F5FE] border-[#00201C]'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="barrierReason"
                          value={key}
                          checked={selectedBarrier === key}
                          onChange={() => setSelectedBarrier(key)}
                          className="mt-0.5 accent-[#00201C]"
                        />
                        <div>
                          <div className="font-semibold text-xs text-black">{item.label}</div>
                          <div className="text-[10px] text-gray-500">{item.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Additional Note */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 block">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Menunggu kapal nelayan dari pulau seberang"
                  value={barrierNote}
                  onChange={(e) => setBarrierNote(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00201C] focus:outline-none"
                />
              </div>

              {/* New Date Selector */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="font-bold text-gray-700 block">Pilih Tanggal Baru:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.date}
                      onClick={() => setSelectedDate(slot.date)}
                      disabled={!slot.isAvailable}
                      className={`p-2.5 rounded-xl border text-left text-xs ${
                        selectedDate === slot.date
                          ? 'border-[#00201C] bg-[#E1F5FE] font-bold'
                          : slot.isAvailable
                          ? 'border-gray-200 hover:bg-gray-50'
                          : 'opacity-50 cursor-not-allowed bg-gray-100'
                      }`}
                    >
                      <div>
                        {slot.dayName}, {slot.date}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {slot.isAvailable ? `Sisa ${slot.remainingSlots} slot` : 'Penuh'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#D8E5E2] bg-white flex gap-2">
              <button
                onClick={handleRescheduleSubmit}
                disabled={isSubmitting || !selectedSlotData?.isAvailable}
                className="flex-1 py-3 bg-[#00201C] hover:bg-[#102521] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                Simpan Jadwal Baru
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. CANCEL APPOINTMENT MODAL                                  */}
      {/* ============================================================ */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 border border-[#D8E5E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-black">Batalkan Jadwal Kunjungan?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Jadwal Anda akan dibatalkan dan kuota akan dikembalikan ke Puskesmas. Anda tetap dapat memilih jadwal baru kapan saja.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-700">Alasan pembatalan:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Ya, Batalkan Jadwal
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. WAITLIST MODAL                                            */}
      {/* ============================================================ */}
      {showWaitlistModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowWaitlistModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 space-y-4 border border-[#D8E5E2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-base text-black">Daftar Tunggu Antrean</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Kami akan mencatat preferensi kunjungan Anda untuk tanggal <strong>{selectedDate}</strong>. Petugas Puskesmas akan menghubungi jika ada kuota tambahan atau pembatalan.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleWaitlistSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#00201C] hover:bg-[#102521] text-white font-bold text-xs rounded-xl transition-colors"
              >
                Daftar ke Antrean
              </button>
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
