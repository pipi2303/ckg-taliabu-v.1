import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit2,
  ShieldCheck,
  Building,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { EntityTable, Column } from '../../components/common/EntityTable';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { SensitivityBadge } from '../../components/common/SensitivityBadge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { facilityService } from '../../services/facilityService';
import { regionService } from '../../services/regionService';
import { permissionService } from '../../services/permissionService';
import { auditRepo } from '../../repositories/auditRepo';
import { RoleId, Status, User, HealthFacility, Kecamatan, Desa } from '../../types';
import { subscribeToStorage } from '../../repositories/storage';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
  const [desaList, setDesaList] = useState<Desa[]>([]);

  const [roleFilter, setRoleFilter] = useState<RoleId | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL');
  const [kecFilter, setKecFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const { openModal, closeModal, saveDraft, getDraft, clearDraft } = useModal();
  const toast = useToast();
  const { currentUser } = useAuth();

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const u = await userService.getUsers(currentUser);
      const f = await facilityService.getFacilities();
      const k = await regionService.getKecamatanList();
      const d = await regionService.getDesaList();
      setUsers(u);
      setFacilities(f);
      setKecamatanList(k);
      setDesaList(d);
    } catch (err: any) {
      toast.error('Gagal Memuat Data Pengguna', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, [currentUser]);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.roleId !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (facilityFilter !== 'ALL' && u.facilityId !== facilityFilter) return false;
    if (kecFilter !== 'ALL' && !u.areaScopes.includes(kecFilter)) return false;
    return true;
  });

  // Action: Open User Detail Modal
  const handleOpenUserDetail = async (user: User) => {
    const userAudits = await auditRepo.getLogs({ actorUserId: user.id });
    const roleDef = permissionService.getRoleDefinition(user.roleId);

    openModal({
      title: `Profil Pengguna: ${user.name}`,
      subtitle: `${user.roleName} • @${user.username}`,
      size: 'lg',
      content: ({ closeModal }) => {
        const [activeSubTab, setActiveSubTab] = useState<'profile' | 'role' | 'scope' | 'audit'>('profile');

        return (
          <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex border-b border-[#D8E5E2] gap-2">
              <button
                onClick={() => setActiveSubTab('profile')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'profile' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Biodata & Kontak
              </button>
              <button
                onClick={() => setActiveSubTab('role')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'role' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Hak Akses & Plafon Data
              </button>
              <button
                onClick={() => setActiveSubTab('scope')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'scope' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Cakupan Wilayah & Faskes
              </button>
              <button
                onClick={() => setActiveSubTab('audit')}
                className={`pb-2 text-xs font-semibold px-2 border-b-2 -mb-[1px] transition-colors ${
                  activeSubTab === 'audit' ? 'border-[#00201C] text-black' : 'border-transparent text-[#60716D]'
                }`}
              >
                Jejak Aktivitas ({userAudits.length})
              </button>
            </div>

            {/* Profile Tab */}
            {activeSubTab === 'profile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-2">
                  <p className="font-bold text-black text-sm">Akun & Identitas</p>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Nama Lengkap:</span>
                    <strong className="text-black">{user.name}</strong>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Username:</span>
                    <span className="font-mono text-black">@{user.username}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Email Resmi:</span>
                    <span className="text-black">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Nomor Telepon:</span>
                    <span className="text-black">{user.phone}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] space-y-2">
                  <p className="font-bold text-black text-sm">Status & Waktu Sesi</p>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Status Akun:</span>
                    <Badge variant={getStatusBadgeVariant(user.status)} size="sm">
                      {user.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif (Dilarang Masuk)'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Terakhir Masuk:</span>
                    <span className="text-black">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('id-ID')
                        : 'Belum pernah login'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#60716D] block text-[11px]">Dibuat Pada:</span>
                    <span className="text-[#60716D]">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Role & Data Ceiling Tab */}
            {activeSubTab === 'role' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-black">{roleDef.name}</span>
                    <SensitivityBadge level={roleDef.dataCeiling} />
                  </div>
                  <p className="text-[#60716D] mt-1 leading-relaxed">{roleDef.description}</p>
                </div>

                {user.roleId === 'KADER' && (
                  <div className="p-3 bg-[#FFFACD]/50 border border-[#F5EC9C] rounded-lg text-[#8C6407]">
                    <span className="font-bold block">Plafon Keamanan Data Kader: Maksimal S2</span>
                    <p className="mt-0.5 text-[11px] text-[#6D4C04]">
                      Sesuai Kebijakan Data Minimum, akun ini dilarang secara ketat dari menerima hasil tes tensi darah, kadar gula darah, atau diagnosis dokter dari server.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scope Tab */}
            {activeSubTab === 'scope' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                  <span className="font-semibold block text-[#60716D]">Fasilitas Induk Penugasan:</span>
                  <p className="font-bold text-black mt-0.5">{user.facilityName}</p>
                </div>

                <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2]">
                  <span className="font-semibold block text-[#60716D] mb-1.5">Cakupan Wilayah Kerja:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.areaScopeNames.map((scope, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#E1F5FE] text-[#1E5D75] rounded-md font-medium border border-[#BDE3F5]"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {user.villageAssignmentName && (
                  <div className="p-3 bg-[#EBF7F2] border border-[#C6EAD9] rounded-lg text-[#1E583F]">
                    <span className="font-bold block">Desa Binaan Wajib (Kader):</span>
                    <span className="font-semibold">{user.villageAssignmentName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeSubTab === 'audit' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userAudits.length > 0 ? (
                  userAudits.map((a) => (
                    <div
                      key={a.id}
                      className="p-2.5 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-semibold text-black">{a.targetLabel || a.action}</p>
                        <p className="text-[11px] text-[#60716D]">{a.purposeCode || a.entityType}</p>
                      </div>
                      <span className="text-[10px] text-[#AAB8B4] shrink-0">
                        {new Date(a.occurredAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#60716D] text-center py-6">Belum ada aktivitas tercatat untuk akun ini.</p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#D8E5E2]">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Tutup
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  // Action: Add / Edit User Modal with Draft Safety
  const handleOpenUserModal = (userToEdit?: User) => {
    const draftKey = userToEdit ? `edit_user_${userToEdit.id}` : 'create_user';
    const draft = getDraft<any>(draftKey);

    // Filter available roles depending on actor role
    const allRoles = permissionService.getAllRoles();
    const availableRoles =
      currentUser?.roleId === 'KEPALA_PUSKESMAS'
        ? allRoles.filter((r) => ['DOCTOR', 'NURSE_MIDWIFE', 'PHARMACY_OFFICER', 'KADER', 'PUSTU', 'POSYANDU'].includes(r.id))
        : allRoles;

    openModal({
      title: userToEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna / Petugas Baru',
      subtitle: 'Manajemen Akun & Penugasan Wilayah Kerja CKG',
      draftKey,
      size: 'lg',
      content: ({ closeModal, draftKey }) => {
        const [formData, setFormData] = useState({
          name: draft?.name || userToEdit?.name || '',
          username: draft?.username || userToEdit?.username || '',
          email: draft?.email || userToEdit?.email || '',
          phone: draft?.phone || userToEdit?.phone || '',
          roleId: (draft?.roleId || userToEdit?.roleId || availableRoles[0]?.id || 'DOCTOR') as RoleId,
          facilityId: draft?.facilityId || userToEdit?.facilityId || facilities[0]?.id || '',
          areaScopeId: draft?.areaScopeId || userToEdit?.areaScopes[0] || kecamatanList[0]?.id || '',
          villageAssignment: draft?.villageAssignment || userToEdit?.villageAssignment || '',
        });
        const [error, setError] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const isKader = formData.roleId === 'KADER';

        const handleChange = (field: string, val: string) => {
          const updated = { ...formData, [field]: val };
          setFormData(updated);
          if (draftKey) saveDraft(draftKey, updated);
        };

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!currentUser) return;

          if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.facilityId) {
            setError('Nama, Username, Email, dan Fasilitas wajib diisi.');
            return;
          }

          // HARD RULE: KADER REQUIRES DESA BINAAN
          if (isKader && !formData.villageAssignment) {
            setError('Penugasan Desa Binaan wajib dipilih untuk peran Kader.');
            return;
          }

          const selectedFaskes = facilities.find((f) => f.id === formData.facilityId);
          const selectedScopeKec = kecamatanList.find((k) => k.id === formData.areaScopeId);
          const selectedDesa = desaList.find((d) => d.id === formData.villageAssignment);

          setIsSubmitting(true);
          setError(null);
          try {
            if (userToEdit) {
              await userService.updateUser(currentUser, userToEdit.id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                roleId: formData.roleId,
                facilityId: formData.facilityId,
                facilityName: selectedFaskes?.name || userToEdit.facilityName,
                areaScopes: [formData.areaScopeId],
                areaScopeNames: [selectedScopeKec?.name || 'Wilayah Terkait'],
                villageAssignment: isKader ? formData.villageAssignment : undefined,
                villageAssignmentName: isKader && selectedDesa ? `Desa ${selectedDesa.name} (Desa Binaan)` : undefined,
              });
              toast.success('Pengguna Diperbarui', `Data ${formData.name} berhasil disimpan.`);
            } else {
              await userService.createUser(currentUser, {
                name: formData.name,
                username: formData.username.toLowerCase(),
                email: formData.email,
                phone: formData.phone,
                roleId: formData.roleId,
                facilityId: formData.facilityId,
                facilityName: selectedFaskes?.name || '',
                areaScopes: [formData.areaScopeId],
                areaScopeNames: [selectedScopeKec?.name || 'Wilayah Terkait'],
                villageAssignment: isKader ? formData.villageAssignment : undefined,
                villageAssignmentName: isKader && selectedDesa ? `Desa ${selectedDesa.name} (Desa Binaan)` : undefined,
              });
              toast.success('Pengguna Ditambahkan', `Akun ${formData.name} berhasil dibuat.`);
            }
            if (draftKey) clearDraft(draftKey);
            closeModal();
          } catch (err: any) {
            setError(err.message || 'Gagal menyimpan pengguna.');
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#FDF0F0] border border-[#F8C6C6] text-xs text-[#9A2D2D] rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap & Gelar"
                required
                placeholder="Contoh: dr. Fauzi Akbar Sanusi"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />

              <Input
                label="Username Akun"
                required
                disabled={!!userToEdit}
                placeholder="Contoh: dr.siti / kader.bobong"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                helperText={userToEdit ? 'Username tidak dapat diubah setelah dibuat' : 'Huruf kecil, tanpa spasi'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Resmi / Pribadi"
                type="email"
                required
                placeholder="email@puskesmas.id"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />

              <Input
                label="Nomor WhatsApp / HP"
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Peran / Role Pengguna"
                required
                value={formData.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
                options={availableRoles.map((r) => ({ value: r.id, label: `${r.name} (${r.category})` }))}
              />

              <Select
                label="Fasilitas Kesehatan Penugasan"
                required
                value={formData.facilityId}
                onChange={(e) => handleChange('facilityId', e.target.value)}
                options={facilities.map((f) => ({ value: f.id, label: `${f.name} (${f.type})` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Cakupan Kecamatan Kerja"
                required
                value={formData.areaScopeId}
                onChange={(e) => handleChange('areaScopeId', e.target.value)}
                options={kecamatanList.map((k) => ({ value: k.id, label: k.name }))}
              />

              {isKader ? (
                <Select
                  label="Desa Binaan (Wajib untuk Kader)"
                  required
                  value={formData.villageAssignment}
                  onChange={(e) => handleChange('villageAssignment', e.target.value)}
                  placeholderOption="-- Pilih Desa Binaan --"
                  options={desaList.map((d) => ({ value: d.id, label: `Desa ${d.name} (${d.kecamatanName})` }))}
                  helperText="Kader hanya memiliki akses pada data warga di desa binaannya"
                />
              ) : (
                <div className="flex items-center text-xs text-[#60716D] p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] mt-6">
                  <span>Peran ini mencakup faskes dan wilayah kecamatan terpilih.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#D8E5E2]">
              <Button type="button" variant="outline" size="md" onClick={closeModal}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                Simpan Pengguna
              </Button>
            </div>
          </form>
        );
      },
    });
  };

  // Action: Deactivate / Reactivate User
  const handleToggleStatus = (user: User) => {
    const isActivating = user.status === 'INACTIVE';
    openModal({
      title: isActivating ? 'Aktifkan Kembali Pengguna?' : 'Nonaktifkan Pengguna?',
      subtitle: `Konfirmasi Akun: ${user.name} (@${user.username})`,
      size: 'sm',
      content: ({ closeModal }) => {
        const [reason, setReason] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleConfirm = async () => {
          if (!currentUser) return;
          setIsSubmitting(true);
          try {
            await userService.toggleUserStatus(
              currentUser,
              user.id,
              isActivating ? 'ACTIVE' : 'INACTIVE',
              reason,
            );
            toast.success(
              isActivating ? 'Pengguna Diaktifkan' : 'Pengguna Dinonaktifkan',
              `Akun ${user.name} berhasil diubah statusnya.`,
            );
            closeModal();
          } catch (err: any) {
            toast.error('Gagal Mengubah Status', err.message);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="p-3 bg-[#F8FBFA] rounded-lg border border-[#D8E5E2] text-xs text-[#60716D] leading-relaxed">
              {isActivating ? (
                <span>Pengguna akan kembali dapat masuk ke sistem CKG dengan peran dan hak aksesnya.</span>
              ) : (
                <span>
                  <strong>Aturan Keamanan:</strong> Tidak ada penghapusan permanen (hard delete). Akun yang dinonaktifkan akan segera diputus sesinya dan tidak dapat masuk kembali, namun seluruh jejak audit tetap terjaga.
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Catatan Alasan Perubahan Status
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Mutasi tugas, cuti kerja, rotasi"
                className="w-full text-xs p-2 rounded-lg border border-[#D8E5E2] text-black focus:ring-1 focus:ring-[#00201C]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Batal
              </Button>
              <Button
                variant={isActivating ? 'success' : 'danger'}
                size="sm"
                isLoading={isSubmitting}
                onClick={handleConfirm}
              >
                {isActivating ? 'Aktifkan Kembali' : 'Nonaktifkan Pengguna'}
              </Button>
            </div>
          </div>
        );
      },
    });
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nama Pengguna',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-black block">{row.name}</span>
          <span className="text-[11px] text-[#60716D]">@{row.username} • {row.email}</span>
        </div>
      ),
    },
    {
      key: 'roleName',
      header: 'Peran & Wewenang',
      sortable: true,
      render: (row) => {
        let variant: any = 'neutral';
        if (row.roleId === 'ADMIN_DINKES') variant = 'published';
        if (row.roleId === 'DOCTOR') variant = 'review';
        if (row.roleId === 'KADER') variant = 'pending';
        if (row.roleId === 'KEPALA_PUSKESMAS') variant = 'approved';

        return (
          <div>
            <Badge variant={variant} size="sm">{row.roleName}</Badge>
            {row.villageAssignmentName && (
              <span className="block text-[10px] text-[#2E7D5B] font-medium mt-0.5">
                {row.villageAssignmentName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'facilityName',
      header: 'Fasilitas Kesehatan',
      sortable: true,
      render: (row) => <span className="text-xs font-medium text-black">{row.facilityName}</span>,
    },
    {
      key: 'areaScopeNames',
      header: 'Cakupan Wilayah',
      render: (row) => (
        <span className="text-xs text-[#397B94] font-medium">
          {row.areaScopeNames.join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Terakhir Masuk',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-[#60716D]">
          {row.lastLogin
            ? new Date(row.lastLogin).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Belum pernah'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUserDetail(row)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Detail
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenUserModal(row)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'ACTIVE' ? 'outline' : 'success'}
            size="sm"
            onClick={() => handleToggleStatus(row)}
            disabled={currentUser?.id === row.id}
            className={row.status === 'ACTIVE' ? 'text-[#C84A4A] hover:bg-[#FDF0F0]' : ''}
          >
            {row.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <h3 className="text-base font-bold text-black">Manajemen Pengguna & Akun Petugas</h3>
          <p className="text-xs text-[#60716D] mt-0.5">
            Daftar petugas Dinkes, staf Puskesmas, Bidan, Perawat, dan Kader Kesehatan Desa Kabupaten Pulau Taliabu.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenUserModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          + Tambah Pengguna
        </Button>
      </div>

      <EntityTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        searchPlaceholder="Cari nama pengguna, username, email, atau faskes..."
        filters={[
          {
            key: 'role',
            label: 'Peran',
            value: roleFilter,
            onChange: (v) => setRoleFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Peran' },
              ...permissionService.getAllRoles().map((r) => ({ value: r.id, label: r.name })),
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v as any),
            options: [
              { value: 'ALL', label: 'Semua Status' },
              { value: 'ACTIVE', label: 'Aktif Saja' },
              { value: 'INACTIVE', label: 'Nonaktif Saja' },
            ],
          },
          {
            key: 'facility',
            label: 'Fasilitas',
            value: facilityFilter,
            onChange: (v) => setFacilityFilter(v),
            options: [
              { value: 'ALL', label: 'Semua Fasilitas' },
              ...facilities.map((f) => ({ value: f.id, label: f.name })),
            ],
          },
        ]}
        onRefresh={loadData}
        emptyTitle="Belum Ada Pengguna"
        emptyDescription="Tambahkan akun petugas atau kader kesehatan."
      />
    </div>
  );
};
