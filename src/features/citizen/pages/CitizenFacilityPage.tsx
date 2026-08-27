import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckSquare,
  Ship,
  Info,
  ChevronLeft,
  PhoneCall,
  Navigation,
} from 'lucide-react';
import { useCitizen } from '../context/CitizenContext';
import { citizenFacilityService } from '../../../services/citizenFacilityService';
import { TaliabuFacilityDetail } from '../../../mock/initialCitizenData';
import { DocBadge } from '../components/DocBadge';

interface CitizenFacilityPageProps {
  onBack: () => void;
}

export const CitizenFacilityPage: React.FC<CitizenFacilityPageProps> = ({ onBack }) => {
  const { citizen } = useCitizen();
  const [facilityInfo, setFacilityInfo] = useState<TaliabuFacilityDetail | null>(null);
  const [activeFacilityTab, setActiveFacilityTab] = useState<'PKM' | 'RSUD'>('PKM');

  const facilityId = activeFacilityTab === 'PKM' ? citizen?.facilityId || 'FASKES-PKM-01' : 'FASKES-RSUD-01';

  useEffect(() => {
    const load = async () => {
      const info = await citizenFacilityService.getFacilityInfo(facilityId);
      setFacilityInfo(info);
    };
    load();
  }, [facilityId]);

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-black">Fasilitas & Lokasi</h1>
            <p className="text-xs text-[#60716D]">
              Informasi alamat, jam pelayanan, dan akses transportasi
            </p>
          </div>
        </div>

        <DocBadge
          code="SCR-WRG-C03"
          title="Informasi Fasilitas & Logistik"
          phase="F2"
          plafon="S0"
          useCase="UC PSN-13"
          description="Lokasi, jam buka, rute maritim teks tanpa peta daring, dan persiapan puasa/dokumen."
          rules={[
            'Berfungsi tanpa peta daring (rute teks & maritim perahu/longboat).',
            'Keterangan persiapan puasa diturunkan otomatis dari paket lab.',
          ]}
          variant="slate"
          size="xs"
        />
      </div>

      {/* Facility Selector Tabs */}
      <div className="flex rounded-xl bg-gray-200/80 p-1 text-xs">
        <button
          onClick={() => setActiveFacilityTab('PKM')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all ${
            activeFacilityTab === 'PKM'
              ? 'bg-white text-black shadow-xs'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          Puskesmas Bobong (FKTP)
        </button>
        <button
          onClick={() => setActiveFacilityTab('RSUD')}
          className={`flex-1 py-2 font-bold rounded-lg transition-all ${
            activeFacilityTab === 'RSUD'
              ? 'bg-white text-black shadow-xs'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          RSUD Bobong (Rujukan)
        </button>
      </div>

      {facilityInfo && (
        <div className="space-y-4">
          {/* Main Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D8E5E2] shadow-2xs space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#60716D]">
                {facilityInfo.type}
              </div>
              <h2 className="text-lg font-bold text-black leading-snug mt-0.5">
                {facilityInfo.name}
              </h2>
            </div>

            {/* Address & Hours */}
            <div className="space-y-3 text-xs border-t border-[#D8E5E2] pt-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-black">Alamat:</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">{facilityInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-black">Waktu Pelayanan:</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    {facilityInfo.serviceDays} • {facilityInfo.serviceHours}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-black shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-black">Nomor Kontak:</span>
                  <p className="text-gray-600 text-[11px] mt-0.5">{facilityInfo.phone}</p>
                </div>
              </div>
            </div>

            {/* Call Facility CTA */}
            <a
              href={`tel:${facilityInfo.phone.replace(/[^0-9]/g, '')}`}
              className="w-full py-3 bg-[#00201C] hover:bg-[#102521] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <PhoneCall className="w-4 h-4 text-[#FFFACD]" />
              Hubungi {facilityInfo.name.split(' ')[0]}
            </a>
          </div>

          {/* Transport & Island Boat Notes */}
          <div className="bg-[#E1F5FE]/60 border border-[#b8e5fa] p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-black font-bold text-xs">
              <Ship className="w-4 h-4" />
              <span>Akses & Transportasi Pulau Taliabu</span>
            </div>
            <p className="text-xs text-black leading-relaxed">
              {facilityInfo.transportNotes}
            </p>
            {facilityInfo.boatScheduleNote && (
              <div className="p-2.5 bg-white rounded-xl border border-[#D8E5E2] text-[11px] text-black font-medium">
                🚢 <strong>Jadwal Transportasi Laut:</strong> {facilityInfo.boatScheduleNote}
              </div>
            )}
          </div>

          {/* What to Bring Checklist */}
          <div className="bg-white p-4 rounded-2xl border border-[#D8E5E2] space-y-2.5 shadow-2xs">
            <h3 className="text-xs font-bold text-black flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-black" />
              Dokumen & Perlengkapan yang Perlu Dibawa
            </h3>
            <ul className="space-y-1.5">
              {facilityInfo.whatToBring.map((item, idx) => (
                <li
                  key={idx}
                  className="text-xs text-gray-700 flex items-start gap-2 bg-[#F8FBFA] p-2 rounded-lg border border-gray-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00201C] shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
