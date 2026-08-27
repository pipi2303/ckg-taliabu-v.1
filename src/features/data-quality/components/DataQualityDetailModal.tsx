import React, { useState } from 'react';
import { DataQualityIssue, Citizen } from '../../../types';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { rawStorage } from '../../../repositories/storage';
import { dataQualityRepo } from '../../../repositories/dataQualityRepo';
import { citizenRepo } from '../../../repositories/citizenRepo';
import { auditService } from '../../../services/auditService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { AlertTriangle, UserCheck, UserPlus, MapPinOff, ArrowRight } from 'lucide-react';

interface DataQualityDetailModalProps {
  issue: DataQualityIssue;
  onSuccess: () => void;
  closeModal: () => void;
}

export const DataQualityDetailModal: React.FC<DataQualityDetailModalProps> = ({
  issue,
  onSuccess,
  closeModal,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const candidates: Citizen[] = (issue.candidateCitizenIds || [])
    .map((id) => rawStorage.getCitizens().find((c) => c.id === id))
    .filter((c): c is Citizen => c !== undefined);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(candidates[0]?.id || '');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);
  const raw = issue.rawRecord || {};

  const handleResolve = async (action: 'MATCH_EXISTING' | 'CREATE_NEW' | 'MARK_OUTSIDE_AREA' | 'REJECT') => {
    if (!currentUser) return;
    if (!resolutionNotes.trim()) {
      toast.warning('Catatan Keputusan Wajib Diisi', 'Silakan masukkan keterangan alasan verifikasi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'MATCH_EXISTING' && selectedCandidate) {
        // Link to existing citizen
        await dataQualityRepo.resolve(
          issue.id,
          'MATCH_EXISTING',
          resolutionNotes,
          currentUser,
          selectedCandidate.id
        );

        await auditService.log(currentUser, 'UPDATE', 'DATA_QUALITY_ISSUE', {
          targetLabel: `Pemadanan: ${issue.citizenName} -> ${selectedCandidate.fullName}`,
          citizenId: selectedCandidate.id,
          purposeCode: 'DQ_MATCH_EXISTING_CITIZEN',
          details: { issueId: issue.id, candidateId: selectedCandidate.id, notes: resolutionNotes },
        });

        toast.success('Identitas Berhasil Dipadankan', `Catatan CKG dialokasikan ke warga ${selectedCandidate.fullName}.`);
      } else if (action === 'CREATE_NEW') {
        // Create new citizen
        const newCitizen = await citizenRepo.create(
          {
            fullName: issue.citizenName,
            birthDate: raw.dob || raw.birthDate || '1980-01-01',
            sex: raw.sex === 'FEMALE' ? 'FEMALE' : 'MALE',
            phonePrimary: raw.phone || undefined,
            villageId: 'DESA-820801-001',
            villageName: 'Bobong',
            kecamatanId: 'KEC-820801',
            kecamatanName: 'Taliabu Barat',
            facilityId: issue.facilityId || 'FASKES-PKM-01',
            facilityName: issue.facilityName || 'Puskesmas Bobong',
            vitalStatus: 'ALIVE',
          },
          issue.identifierValue
        );

        await dataQualityRepo.resolve(
          issue.id,
          'CREATE_NEW',
          resolutionNotes,
          currentUser,
          newCitizen.id
        );

        await auditService.log(currentUser, 'CREATE', 'CITIZEN', {
          targetLabel: `Identitas Baru dari DQ: ${newCitizen.fullName}`,
          citizenId: newCitizen.id,
          purposeCode: 'DQ_CREATE_NEW_CITIZEN',
          details: { issueId: issue.id, citizenId: newCitizen.id, notes: resolutionNotes },
        });

        toast.success('Identitas Baru Dibuat', `Warga baru ${newCitizen.fullName} berhasil ditambahkan ke registry.`);
      } else if (action === 'MARK_OUTSIDE_AREA') {
        await dataQualityRepo.resolve(
          issue.id,
          'MARK_OUTSIDE_AREA',
          resolutionNotes,
          currentUser
        );

        await auditService.log(currentUser, 'UPDATE', 'DATA_QUALITY_ISSUE', {
          targetLabel: `Luar Wilayah: ${issue.citizenName}`,
          purposeCode: 'DQ_OUTSIDE_AREA_MARK',
          details: { issueId: issue.id, notes: resolutionNotes },
        });

        toast.info('Ditandai Luar Wilayah', 'Catatan ini diarsipkan sebagai skrining luar wilayah kerja Taliabu.');
      } else if (action === 'REJECT') {
        await dataQualityRepo.resolve(issue.id, 'REJECT', resolutionNotes, currentUser);
        toast.warning('Catatan Ditolak', 'Catatan dibatalkan dari proses ingestion.');
      }

      onSuccess();
      closeModal();
    } catch (err: any) {
      toast.error('Gagal Menyelesaikan Masalah', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Problem Summary Box */}
      <div className="p-3.5 bg-[#FFFACD] rounded-xl border border-[#F2ECC2] flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#C99720] shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black">{issue.problemType}</span>
            <Badge variant="warning" size="sm">
              Status: {issue.status}
            </Badge>
          </div>
          <p className="text-xs text-[#554700] mt-1 leading-relaxed">{issue.problemDescription}</p>
        </div>
      </div>

      {/* Difference Comparison Table */}
      {selectedCandidate && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-black">
            Tabel Perbandingan: Data Sumber vs Kandidat Registry Terdaftar
          </span>
          <div className="overflow-x-auto border border-[#D8E5E2] rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[11px] text-[#60716D]">
                <tr>
                  <th className="p-2.5 text-left">Atribut Data</th>
                  <th className="p-2.5 text-left bg-amber-50/50">Data Sumber (ASIK/File)</th>
                  <th className="p-2.5 text-left bg-emerald-50/50">Data Kandidat Registry</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E5E2]">
                <tr>
                  <td className="p-2.5 font-semibold text-black">Nama Lengkap</td>
                  <td className="p-2.5 bg-amber-50/20 font-bold text-black">{issue.citizenName}</td>
                  <td className="p-2.5 bg-emerald-50/20 font-bold text-black">{selectedCandidate.fullName}</td>
                  <td className="p-2.5 text-center">
                    {issue.citizenName.toLowerCase() === selectedCandidate.fullName.toLowerCase() ? (
                      <span className="text-[10px] text-[#2E7D5B] font-bold">Identik</span>
                    ) : (
                      <span className="text-[10px] text-[#C99720] font-bold">Berbeda Ejaan</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-black">Nomor NIK</td>
                  <td className="p-2.5 bg-amber-50/20 font-mono">{issue.identifierValue || '—'}</td>
                  <td className="p-2.5 bg-emerald-50/20 font-mono">
                    {rawStorage.getCitizenIdentifiers().find((i) => i.citizenId === selectedCandidate.id)?.identifierValue || '—'}
                  </td>
                  <td className="p-2.5 text-center">
                    {issue.identifierValue === rawStorage.getCitizenIdentifiers().find((i) => i.citizenId === selectedCandidate.id)?.identifierValue ? (
                      <span className="text-[10px] text-[#2E7D5B] font-bold">Cocok</span>
                    ) : (
                      <span className="text-[10px] text-[#C84A4A] font-bold">Beda NIK</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-black">Tanggal Lahir</td>
                  <td className="p-2.5 bg-amber-50/20">{raw.dob || '—'}</td>
                  <td className="p-2.5 bg-emerald-50/20">{selectedCandidate.birthDate}</td>
                  <td className="p-2.5 text-center">
                    {raw.dob === selectedCandidate.birthDate ? (
                      <span className="text-[10px] text-[#2E7D5B] font-bold">Sama</span>
                    ) : (
                      <span className="text-[10px] text-[#60716D]">Periksa Fisik</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-black">Desa & Faskes</td>
                  <td className="p-2.5 bg-amber-50/20">{raw.village || issue.facilityName || '—'}</td>
                  <td className="p-2.5 bg-emerald-50/20">
                    Desa {selectedCandidate.villageName} ({selectedCandidate.facilityName})
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="text-[10px] text-[#2E7D5B] font-bold">Dalam Wilayah</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolution Notes */}
      <div>
        <label className="block text-xs font-bold text-black mb-1">
          Keterangan / Catatan Verifikasi Petugas <span className="text-[#C84A4A]">*</span>
        </label>
        <textarea
          rows={2}
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Contoh: Telah dikonfirmasi dengan buku register posyandu desa bahwa warga adalah orang yang sama..."
          className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00201C]"
          required
        />
      </div>

      {/* Action Buttons for Resolution */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#D8E5E2]">
        <Button variant="ghost" size="sm" type="button" onClick={closeModal}>
          Tutup
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {issue.problemType === 'OUTSIDE_WORK_AREA' && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleResolve('MARK_OUTSIDE_AREA')}
              leftIcon={<MapPinOff className="w-3.5 h-3.5" />}
            >
              Tandai Luar Wilayah
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleResolve('CREATE_NEW')}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Buat Warga Baru
          </Button>

          {selectedCandidate && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={() => handleResolve('MATCH_EXISTING')}
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Padankan ke {selectedCandidate.fullName}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
