import React, { useState } from 'react';
import { Shield, ShieldAlert, Check, X, Info, Lock, Eye, Users } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SensitivityBadge } from '../../components/common/SensitivityBadge';
import { permissionService, SENSITIVITY_DESCRIPTIONS } from '../../services/permissionService';
import { RoleDefinition, RoleId, SensitivityLevel } from '../../types';
import { useModal } from '../../context/ModalContext';
import { Button } from '../../components/common/Button';
import { DinkesRoleComparisonInfographic } from './components/DinkesRoleComparisonInfographic';

export const RolesPage: React.FC = () => {
  const roles = permissionService.getAllRoles();
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[0]);
  const { openModal } = useModal();

  const handleOpenRoleDetail = (role: RoleDefinition) => {
    openModal({
      title: `Detail Hak Akses: ${role.name}`,
      subtitle: `Kategori: ${role.category} • Plafon: ${role.dataCeiling}`,
      size: 'lg',
      content: ({ closeModal }) => (
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-[#F8FBFA] rounded-xl border border-[#D8E5E2] space-y-2">
            <p className="font-bold text-sm text-black">{role.name}</p>
            <p className="text-[#60716D] leading-relaxed">{role.description}</p>
            <div className="pt-2 flex items-center gap-2">
              <span className="font-semibold text-black">Batas Plafon Data:</span>
              <SensitivityBadge level={role.dataCeiling} showDescription />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#60716D] mb-2">
              Daftar Izin & Wewenang Sistem:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {[
                role.canManageUsers && 'Kelola Akun Pengguna',
                role.canManageFacilities && 'Kelola Fasilitas Kesehatan',
                role.canManageRegions && 'Kelola Master Wilayah',
                role.canViewAudit && 'Akses Jejak Audit',
                role.canManageRuleVersions && 'Kelola Versi Aturan Klinis',
                role.canAccessClinicalData && 'Akses Rekam Data Medis',
              ]
                .filter(Boolean)
                .map((perm) => (
                  <div
                    key={perm as string}
                    className="p-2 bg-white rounded-lg border border-[#D8E5E2] flex items-center gap-2 font-medium text-[11px] text-black"
                  >
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />
                    <span className="truncate">{perm}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#D8E5E2]">
            <Button variant="outline" size="sm" onClick={closeModal}>
              Tutup
            </Button>
          </div>
        </div>
      ),
    });
  };

  const matrixColumns: SensitivityLevel[] = ['S0', 'S1', 'S2', 'S3', 'S4'];

  return (
    <div className="space-y-6">
      {/* Policy Banner */}
      <div className="bg-[#FFFACD]/40 border border-[#F5EC9C] p-4 rounded-xl text-xs text-[#8C6407] space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-sm text-[#6D4C04]">
          <ShieldAlert className="w-4 h-4 text-[#C99720]" />
          <span>Kebijakan Data Minimum & Plafon Keamanan CKG (S0 – S4)</span>
        </div>
        <p className="leading-relaxed">
          Setiap peran dalam platform CKG dibatasi secara ketat berdasarkan prinsip <em>Least Privilege</em>. Petugas lapangan (Kader) memiliki batas plafon data <strong>S2</strong> sehingga tidak dapat menerima maupun melihat data hasil laboratorium klinis (tensi, gula darah, diagnosis) dari server.
        </p>
      </div>

      {/* Sensitivity Descriptions Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {matrixColumns.map((lvl) => {
          const meta = SENSITIVITY_DESCRIPTIONS[lvl];
          return (
            <div key={lvl} className="p-3 bg-white rounded-xl border border-[#D8E5E2] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black">{meta.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${meta.color}`}>
                  {lvl}
                </span>
              </div>
              <p className="text-[11px] text-[#60716D] leading-tight">{meta.description}</p>
            </div>
          );
        })}
      </div>

      {/* Roles Grid & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Role List Selection */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#60716D] uppercase tracking-wider px-1">
            Daftar Peran Standar ({roles.length})
          </h3>
          <div className="space-y-1.5">
            {roles.map((r) => {
              const isSelected = selectedRole.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#00201C] text-white border-[#00201C] shadow-xs'
                      : 'bg-white text-black border-[#D8E5E2] hover:bg-[#F8FBFA]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-black'}`}>
                      {r.name}
                    </p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-emerald-300' : 'text-[#60716D]'}`}>
                      {r.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <SensitivityBadge level={r.dataCeiling} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRoleDetail(r);
                      }}
                      className={`p-1 rounded hover:bg-white/20 ${isSelected ? 'text-white' : 'text-[#60716D]'}`}
                      title="Lihat Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Role Detail & Permission Matrix */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E5E2] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2E7D5B]" />
                <h4 className="text-base font-bold text-black">{selectedRole.name}</h4>
              </div>
              <p className="text-xs text-[#60716D] mt-0.5">{selectedRole.description}</p>
            </div>
            <SensitivityBadge level={selectedRole.dataCeiling} showDescription />
          </div>

          {/* Matrix table */}
          <div>
            <h4 className="text-xs font-bold text-black mb-2 uppercase tracking-wide">
              Matriks Batas Akses Sensitivitas Data:
            </h4>
            <div className="overflow-x-auto rounded-lg border border-[#D8E5E2]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#00201C] text-white">
                    <th className="px-3 py-2 font-semibold">Tingkat Sensitivitas</th>
                    <th className="px-3 py-2 font-semibold">Klasifikasi Data</th>
                    <th className="px-3 py-2 font-semibold text-center">Hak Akses Peran Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EFEB]">
                  {matrixColumns.map((lvl) => {
                    const hasAccess = permissionService.hasSensitivityAccess(selectedRole.id, lvl);
                    const meta = SENSITIVITY_DESCRIPTIONS[lvl];

                    return (
                      <tr key={lvl} className={hasAccess ? 'bg-white' : 'bg-[#FAFCFB] opacity-60'}>
                        <td className="px-3 py-2.5 font-bold font-mono">{lvl}</td>
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-black block">{meta.label}</span>
                          <span className="text-[11px] text-[#60716D]">{meta.description}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {hasAccess ? (
                            <span className="inline-flex items-center gap-1 text-[#2E7D5B] font-bold text-xs bg-[#EBF7F2] px-2 py-0.5 rounded border border-[#C6EAD9]">
                              <Check className="w-3.5 h-3.5" /> Diizinkan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#C84A4A] font-bold text-xs bg-[#FDF0F0] px-2 py-0.5 rounded border border-[#F8C6C6]">
                              <Lock className="w-3.5 h-3.5" /> Dilarang (Plafon Terlewati)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Tag list */}
          <div>
            <h4 className="text-xs font-bold text-black mb-2 uppercase tracking-wide">
              Izin Fungsional Utama:
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
              {[
                selectedRole.canManageUsers && 'MANAGE_USERS',
                selectedRole.canManageFacilities && 'MANAGE_FACILITIES',
                selectedRole.canManageRegions && 'MANAGE_REGIONS',
                selectedRole.canViewAudit && 'VIEW_AUDIT_LOGS',
                selectedRole.canManageRuleVersions && 'MANAGE_RULE_VERSIONS',
                selectedRole.canAccessClinicalData && 'ACCESS_CLINICAL_DATA',
              ]
                .filter(Boolean)
                .map((p) => (
                  <span
                    key={p as string}
                    className="px-2 py-1 bg-[#F8FBFA] text-black rounded text-[11px] font-mono border border-[#D8E5E2]"
                  >
                    {p}
                  </span>
                ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Dinkes Role Comparison & Collaboration Infographic */}
      <div className="pt-2">
        <DinkesRoleComparisonInfographic />
      </div>
    </div>
  );
};
