import React, { useState } from 'react';
import { X, Shield, Lock, FileSearch, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, DrilldownPurposeDefinition } from '../../../types';
import { populationPrivacyService } from '../../../services/populationPrivacyService';

interface DrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contextDescription: string;
  currentUser: User | null;
  items: Array<{
    id: string;
    label: string;
    subLabel: string;
    facilityName: string;
    kecamatanName: string;
    villageName?: string;
    stageOrStatus: string;
    daysStuck?: number;
  }>;
}

export const DrilldownModal: React.FC<DrilldownModalProps> = ({
  isOpen,
  onClose,
  title,
  contextDescription,
  currentUser,
  items,
}) => {
  const [selectedPurposeCode, setSelectedPurposeCode] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const validPurposes: DrilldownPurposeDefinition[] = currentUser
    ? populationPrivacyService.getApprovedDrilldownPurposes(currentUser.roleId)
    : [];

  const isBupati = currentUser?.roleId === 'BUPATI';

  const handleUnlock = async () => {
    if (!currentUser) return;
    setErrorMessage(null);

    const result = await populationPrivacyService.authorizeAndAuditDrilldown({
      user: currentUser,
      purposeCode: selectedPurposeCode,
      filterCriteria: { context: title },
      rowCount: items.length,
      targetContext: title,
    });

    if (!result.authorized) {
      setErrorMessage(result.reason || 'Otorisasi penelusuran gagal.');
      return;
    }

    setIsUnlocked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{contextDescription}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {isBupati ? (
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <Lock className="w-5 h-5" />
                Akses Penelusuran Individual Dibatasi
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Sesuai batasan kewenangan privasi akun Anda, penelusuran data tingkat individual/warga tidak diperkenankan. Anda dapat menggunakan Ringkasan Wilayah untuk melihat gambaran makro.
              </p>
            </div>
          ) : !isUnlocked ? (
            /* Purpose Selection Form */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2">
                  <Shield className="w-4 h-4" />
                  Kepatuhan Tata Kelola & Jejak Audit (Audit Trail)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Penelusuran data agregat ke tingkat operasional memerlukan pencatatan <strong>Tujuan Penelusuran (Purpose Code)</strong> yang sah. Aktivitas penelusuran ini akan dicatat ke dalam audit log Dinkes secara permanen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Pilih Tujuan Penelusuran yang Sah:
                </label>
                <div className="space-y-2">
                  {validPurposes.map((p) => (
                    <label
                      key={p.code}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedPurposeCode === p.code
                          ? 'bg-teal-500/10 border-teal-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="drilldown_purpose"
                        value={p.code}
                        checked={selectedPurposeCode === p.code}
                        onChange={(e) => setSelectedPurposeCode(e.target.value)}
                        className="mt-0.5 text-teal-500 focus:ring-teal-500"
                      />
                      <div>
                        <div className="font-semibold text-xs text-slate-200">{p.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                disabled={!selectedPurposeCode}
                onClick={handleUnlock}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Konfirmasi & Buka Penelusuran ({items.length} Kasus)
              </button>
            </div>
          ) : (
            /* Unlocked Minimal Non-Clinical Operational View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Menampilkan data operasional minimum ({items.length} rekaman):</span>
                <span className="text-emerald-400 font-mono text-[11px]">Audit Logged: {selectedPurposeCode}</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Subjek / NIK Masked</th>
                      <th className="py-2.5 px-3">Puskesmas / Wilayah</th>
                      <th className="py-2.5 px-3">Tahap / Status</th>
                      <th className="py-2.5 px-3 text-right">Tertahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-white">{item.label}</div>
                          <div className="text-[11px] text-slate-500">{item.subLabel}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div>{item.facilityName}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.kecamatanName} {item.villageName ? `• ${item.villageName}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                            {item.stageOrStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-300">
                          {item.daysStuck !== undefined ? `${item.daysStuck} hari` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
