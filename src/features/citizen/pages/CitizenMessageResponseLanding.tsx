import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { citizenResponseService, AttendanceResponseChoice } from '../../../services/citizenResponseService';
import { citizenResponseRepo } from '../../../repositories/citizenResponseRepo';
import { appointmentRepo } from '../../../repositories/appointmentRepo';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { BARRIER_REASON_LABELS } from '../../../services/citizenCopyDictionary';
import { SharedBarrierReason, CitizenResponseToken, Appointment, Citizen } from '../../../types';

interface CitizenMessageResponseLandingProps {
  tokenId: string;
  onOpenFullApp: () => void;
}

export const CitizenMessageResponseLanding: React.FC<CitizenMessageResponseLandingProps> = ({
  tokenId,
  onOpenFullApp,
}) => {
  const [token, setToken] = useState<CitizenResponseToken | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedBarrier, setSelectedBarrier] = useState<SharedBarrierReason>('DISTANCE_TRANSPORT');
  const [showBarrierPicker, setShowBarrierPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const t = await citizenResponseService.validateToken(tokenId);
        if (t) {
          setToken(t);
          if (t.appointmentId) {
            const apt = await appointmentRepo.getById(t.appointmentId);
            setAppointment(apt);
          }
          const c = await citizenRepo.getById(t.citizenId);
          setCitizen(c);
        }
      } catch (err) {
        console.error('Failed to load token response', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [tokenId]);

  const handleResponse = async (choice: AttendanceResponseChoice) => {
    if (!token) return;
    if (choice === 'CANNOT_ATTEND' && !showBarrierPicker) {
      setShowBarrierPicker(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await citizenResponseService.submitAttendanceResponse({
        citizenId: token.citizenId,
        appointmentId: token.appointmentId,
        taskId: token.taskId,
        tokenId: token.id,
        responseChoice: choice,
        barrierReason: choice === 'CANNOT_ATTEND' ? selectedBarrier : undefined,
        channel: 'MESSAGE_LINK',
      });

      if (res.success) {
        setIsSubmitted(true);
        setSuccessMsg(res.message);
      }
    } catch (err) {
      console.error('Failed to submit message response', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F5F4] flex items-center justify-center p-4">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center text-xs animate-pulse">
          Memuat tautan konfirmasi...
        </div>
      </div>
    );
  }

  if (!token || !citizen) {
    return (
      <div className="min-h-screen bg-[#F0F5F4] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-4 shadow-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-black">Tautan Tidak Valid atau Sudah Digunakan</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Tautan konfirmasi ini telah kedaluwarsa atau sudah pernah diisi sebelumnya. Anda dapat membuka aplikasi untuk melihat status terbaru.
          </p>
          <button
            onClick={onOpenFullApp}
            className="w-full py-3 bg-[#00201C] text-white font-bold text-xs rounded-xl"
          >
            Buka Aplikasi Pendamping CKG
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F5F4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#D8E5E2] overflow-hidden">
        {/* Header */}
        <div className="bg-[#00201C] text-white p-5 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FFFACD] text-black">
            Konfirmasi Kehadiran CKG
          </span>
          <h1 className="text-base font-bold text-[#E1F5FE]">
            Halo, {citizen.fullName}
          </h1>
          <p className="text-xs text-[#D8E5E2]">
            {appointment?.facilityName || 'Puskesmas Bobong'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-black">Tanggapan Anda Telah Disimpan</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{successMsg}</p>
              <button
                onClick={onOpenFullApp}
                className="w-full py-3 bg-[#00201C] text-white rounded-xl text-xs font-bold"
              >
                Masuk ke Aplikasi Sahabat Warga
              </button>
            </div>
          ) : (
            <>
              {/* Appointment Card */}
              {appointment && (
                <div className="bg-[#F8FBFA] p-4 rounded-2xl border border-[#D8E5E2] space-y-2 text-xs">
                  <div className="font-semibold text-gray-500">Jadwal yang Ditawarkan:</div>
                  <div className="text-sm font-extrabold text-black">
                    {appointment.scheduledDate} ({appointment.timeSlot})
                  </div>
                  <div className="text-gray-600 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {appointment.facilityName}
                  </div>
                </div>
              )}

              {/* Barrier Options Picker */}
              {showBarrierPicker ? (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Pilih kendala yang dialami:
                  </label>
                  <div className="space-y-1.5">
                    {(Object.keys(BARRIER_REASON_LABELS) as SharedBarrierReason[]).slice(0, 4).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedBarrier(key)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs ${
                          selectedBarrier === key
                            ? 'bg-[#E1F5FE] border-[#00201C] font-bold'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {BARRIER_REASON_LABELS[key].label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleResponse('CANNOT_ATTEND')}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#00201C] text-white font-bold text-xs rounded-xl"
                  >
                    Kirim Konfirmasi Kendala
                  </button>
                </div>
              ) : (
                /* Choice Buttons */
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => handleResponse('ATTENDING')}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#00201C] hover:bg-[#102521] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Saya Akan Datang Sesuai Jadwal
                  </button>

                  <button
                    onClick={onOpenFullApp}
                    className="w-full py-3 bg-[#E1F5FE] hover:bg-[#cbeefa] text-black font-bold text-xs rounded-xl transition-colors"
                  >
                    Ubah ke Jadwal Lain
                  </button>

                  <button
                    onClick={() => setShowBarrierPicker(true)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Belum Bisa Datang (Ada Kendala)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
