import React, { useState, useEffect } from 'react';
import { Map, MapPin, Building2, ChevronRight, ChevronDown, Users, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { regionService } from '../../services/regionService';
import { facilityService } from '../../services/facilityService';
import { Kecamatan, Desa, HealthFacility } from '../../types';

export const CakupanWilayahPage: React.FC = () => {
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [expandedKec, setExpandedKec] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      const k = await regionService.getKecamatanList();
      const d = await regionService.getDesaList();
      const f = await facilityService.getFacilities();
      setKecamatanList(k);
      setDesaList(d);
      setFacilities(f);

      // Expand the first two kecamatan by default
      if (k.length > 0) {
        setExpandedKec({ [k[0].id]: true, [k[1]?.id]: true });
      }
    };
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedKec((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl border border-[#D8E5E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-black">Hierarki Cakupan Wilayah & Jejaring Faskes</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Peta pohon administrasi Kabupaten Pulau Taliabu, 8 Kecamatan, Desa binaan, dan Fasilitas Kesehatan Pengampu.
          </p>
        </div>
        <Badge variant="published" size="md">
          Kabupaten Pulau Taliabu
        </Badge>
      </div>

      {/* Tree Visualization */}
      <div className="space-y-3">
        {kecamatanList.map((kec) => {
          const isExpanded = !!expandedKec[kec.id];
          const desasInKec = desaList.filter((d) => d.kecamatanId === kec.id);
          const faskesInKec = facilities.filter((f) => f.kecamatanId === kec.id);

          return (
            <div key={kec.id} className="bg-white rounded-xl border border-[#D8E5E2] shadow-2xs overflow-hidden">
              {/* Kecamatan Header Bar */}
              <div
                onClick={() => toggleExpand(kec.id)}
                className="p-4 bg-[#F8FBFA] hover:bg-[#F0F5F4] transition-colors flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <button className="text-black">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 text-[#60716D]" />}
                  </button>
                  <div className="p-2 rounded-lg bg-[#00201C] text-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">
                      Kecamatan {kec.name}{' '}
                      <span className="text-xs text-[#60716D] font-normal font-mono">({kec.code})</span>
                    </h4>
                    <p className="text-[11px] text-[#60716D]">
                      {desasInKec.length} Desa Binaan • {faskesInKec.length} Fasilitas Kesehatan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={kec.status === 'ACTIVE' ? 'active' : 'inactive'} size="sm">
                    {kec.status}
                  </Badge>
                </div>
              </div>

              {/* Children (Desas and Facilities) */}
              {isExpanded && (
                <div className="p-4 border-t border-[#D8E5E2] space-y-4">
                  {/* Facilities Grid */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#60716D] block mb-2">
                      Fasilitas Kesehatan di Wilayah Ini:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {faskesInKec.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 bg-[#FAFCFB] rounded-lg border border-[#D8E5E2] flex items-start gap-2.5"
                        >
                          <Building2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-black truncate">{f.name}</p>
                            <p className="text-[10px] text-[#60716D]">{f.type} • Desa {f.desaName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Villages Grid */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#60716D] block mb-2">
                      Desa / Kelurahan Binaan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {desasInKec.map((d) => (
                        <div
                          key={d.id}
                          className="p-2.5 bg-white rounded-lg border border-[#D8E5E2] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-black block">Desa {d.name}</span>
                            <span className="text-[10px] text-[#397B94]">{d.puskesmasName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#AAB8B4]">{d.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
