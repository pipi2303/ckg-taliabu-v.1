import React, { useEffect, useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { OutreachLadderVersion, MessageTemplate } from '../../../types';
import { outreachConfigRepo } from '../../../repositories/outreachConfigRepo';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/common/Button';

export const OutreachConfigPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [ladders, setLadders] = useState<OutreachLadderVersion[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [activeLadder, setActiveLadder] = useState<OutreachLadderVersion | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const allLadders = await outreachConfigRepo.getLadderVersions();
      setLadders(allLadders);
      const active = allLadders.find((l) => l.status === 'ACTIVE') || allLadders[0];
      setActiveLadder(active);
      const tmpls = await outreachConfigRepo.getMessageTemplates();
      setTemplates(tmpls);
    } catch (err) {
      console.error('Failed to load outreach config:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D8E5E2] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#00201C] text-white">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-black tracking-tight">Konfigurasi Jenjang Outreach</h1>
              <p className="text-xs text-[#60716D]">
                Parameter kaskade pengingat berjenjang dan template pesan terstandarisasi untuk Faskes Pulau Taliabu.
              </p>
            </div>
          </div>
        </div>

        {activeLadder && (
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#00201C] text-emerald-300">
            {activeLadder.version} (Aktif)
          </span>
        )}
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 bg-[#FFFACD] border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
            Penegasan Kebijakan & Ketentuan Operasional:
          </p>
          <p className="leading-relaxed">
            <strong>"Jeda jenjang outreach adalah parameter operasional daerah dan bukan ketentuan klinis Juknis."</strong>
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Parameter interval waktu dan batas pengingat disesuaikan dengan kondisi geografis kepulauan dan ketersediaan sarana transportasi lokal Kabupaten Pulau Taliabu.
          </p>
        </div>
      </div>

      {/* Active Ladder Steps */}
      {activeLadder && (
        <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs">Struktur Jenjang Kaskade ({activeLadder.version})</span>
            </div>
            <span className="text-xs text-slate-300">Diterbitkan oleh: {activeLadder.publishedByUserName}</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {activeLadder.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl border border-[#D8E5E2] bg-[#F8FBFA] space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-[#00201C] text-white font-bold text-xs flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-[#D8E5E2] text-black">
                      {step.channel}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-black">Langkah {step.stepNumber}</h4>
                    <p className="text-[11px] text-[#60716D] mt-0.5">
                      Jeda Operasional: <strong>{step.delayDays} Hari</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#D8E5E2] text-[11px] text-[#60716D] space-y-1">
                    <div>Template: <span className="font-mono text-black">{step.templateCode || 'N/A'}</span></div>
                    {step.fallbackChannel && (
                      <div>Fallback: <strong className="text-amber-800">{step.fallbackChannel}</strong></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Templates Library */}
      <div className="bg-white rounded-2xl border border-[#D8E5E2] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#00201C] text-white flex items-center justify-between">
          <div className="font-bold text-xs">Pustaka Template Pesan Terverifikasi Privasi (S0–S2 Only)</div>
          <span className="text-xs text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Kepatuhan UU PDP Terverifikasi
          </span>
        </div>

        <div className="p-6 divide-y divide-[#D8E5E2]">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-black">{tmpl.name}</span>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {tmpl.code}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {tmpl.channel}
                </span>
              </div>

              <div className="p-3 bg-[#F0F5F4] rounded-xl border border-[#D8E5E2] text-xs text-black font-mono leading-relaxed">
                {tmpl.body}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#60716D]">
                <span>Parameter Dinamis: <code>{tmpl.parameters.join(', ')}</code></span>
                <span>Terakhir Diperbarui: {new Date(tmpl.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
