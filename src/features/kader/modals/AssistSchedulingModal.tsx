import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { offlineSchedulingService } from '../../../services/offlineSchedulingService';
import { KaderAssignmentPayload, OfflineSchedulingRequest } from '../../../types';

interface AssistSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: KaderAssignmentPayload;
  onScheduled: (req: OfflineSchedulingRequest) => void;
}

export const AssistSchedulingModal: React.FC<AssistSchedulingModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onScheduled,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  // Next 3 available days for appointment selection
  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // Skip Sunday (0)
      if (d.getDay() !== 0) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const availableDates = generateDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedService, setSelectedService] = useState('Pemeriksaan Lanjutan CKG & Laboratorium Dasar');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitRequest = () => {
    if (!currentUser) return;

    const req = offlineSchedulingService.requestScheduling({
      taskId: assignment.taskId,
      citizenId: assignment.citizenId,
      citizenName: assignment.citizenName,
      preferredFacilityId: 'faskes-1',
      preferredFacilityName: assignment.facilityName || 'Puskesmas Bobong',
      preferredServiceType: selectedService,
      preferredDate: selectedDate,
      userId: currentUser.id,
    });

    setIsSubmitted(true);
    toast.success('Pengajuan Jadwal Tersimpan', 'Pengajuan jadwal akan dipastikan setelah data tersinkronisasi.');
    onScheduled(req);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-[#D8E5E2] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Bantu Jadwalkan (C03)</h3>
              <p className="text-[10px] text-slate-300">Pemeriksaan di {assignment.facilityName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisory Offline Rule Notice (Hard Rule) */}
        <div className="bg-[#E1F5FE] px-3.5 py-2.5 border-b border-[#D8E5E2] text-xs text-black flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div>
            <strong className="block text-[11px] font-bold">Informasi Jadwal Luring</strong>
            <span className="text-[11px] text-[#334643]">
              Jadwal akan dipastikan setelah data berhasil tersinkronisasi dengan kuota Puskesmas.
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {isSubmitted ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2E7D5B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-black">Pengajuan Tersimpan di Antrean!</h4>
              <p className="text-xs text-[#60716D]">
                Data tersimpan di perangkat dan akan dikonfirmasi otomatis saat jaringan tersedia.
              </p>
            </div>
          ) : (
            <>
              {/* Citizen info summary */}
              <div className="p-2.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2]">
                <p className="text-[10px] text-[#60716D] uppercase font-bold">Warga Sasaran</p>
                <p className="text-sm font-bold text-black mt-0.5">{assignment.citizenName}</p>
                <p className="text-[11px] text-[#60716D]">{assignment.addressText}</p>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-[11px] font-bold text-black mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2E7D5B]" />
                  Pilih Tanggal Kunjungan yang Disepakati:
                </label>
                <div className="space-y-1.5">
                  {availableDates.map((dateStr) => {
                    const d = new Date(dateStr);
                    const formatted = d.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    });
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedDate(dateStr)}
                        className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-left flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#EBF7F2] border-[#2E7D5B] text-black font-bold shadow-2xs'
                            : 'bg-white border-[#D8E5E2] text-[#334643] hover:bg-[#F8FBFA]'
                        }`}
                      >
                        <span>{formatted}</span>
                        <span className="text-[10px] text-[#60716D]">08:30 - 11:30 WIT</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service information */}
              <div>
                <label className="block text-[11px] font-bold text-black mb-1">
                  Layanan yang Diberitahukan:
                </label>
                <div className="p-2.5 bg-[#F8FBFA] border border-[#D8E5E2] rounded-xl text-xs text-[#334643]">
                  {selectedService}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSubmitRequest}
                className="w-full min-h-[48px] bg-[#00201C] hover:bg-[#102521] text-white rounded-xl font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Ajukan Jadwal Warga</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
