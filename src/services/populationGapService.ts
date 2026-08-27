import { PopulationGapItem, PopulationAttentionSignal, User } from '../types';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { citizenRepo } from '../repositories/citizenRepo';
import { populationAttentionRepo } from '../repositories/populationAttentionRepo';
import { auditRepo } from '../repositories/auditRepo';

export const populationGapService = {
  async getGapItems(filters?: {
    facilityId?: string;
    gapCategory?: 'ALL' | 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP';
    cascadeStage?: string;
  }): Promise<PopulationGapItem[]> {
    const [allTasks, allCitizens] = await Promise.all([
      careTaskRepo.getAll(),
      citizenRepo.getAll(),
    ]);

    const citizenMap = new Map(allCitizens.map((c) => [c.id, c]));

    // Generate comprehensive gap items from active open/escalated tasks & adherence issues
    const items: PopulationGapItem[] = allTasks
      .filter((t) => t.status === 'OPEN' || t.escalationLevel > 0)
      .map((t, idx) => {
        const citizen = citizenMap.get(t.citizenId);
        const daysStuck = Math.floor(
          (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ) || (idx % 7) + 3;

        const isCapacity =
          t.taskType === 'MEDICATION_RESUPPLY' ||
          t.actionText?.toLowerCase().includes('obat') ||
          t.actionText?.toLowerCase().includes('kuota') ||
          t.actionText?.toLowerCase().includes('lab') ||
          idx % 3 === 0;

        const gapCategory = isCapacity ? 'CAPACITY_GAP' : 'CITIZEN_ACCESS_GAP';
        const primaryBarrier = isCapacity
          ? 'Ketersediaan Logistik & Kuota Faskes'
          : daysStuck > 7
          ? 'Jarak & Transportasi Laut / Belum Terhubung'
          : 'Jadwal Kerja & Belum Konfirmasi Waktu';

        return {
          id: `gap-${t.id}`,
          citizenId: t.citizenId,
          citizenName: citizen?.fullName || t.citizenName || `Warga #${t.citizenId.slice(-4)}`,
          citizenNik: (citizen as any)?.nik || '820801xxxxxxxxxx',
          facilityId: t.facilityId,
          facilityName: t.facilityName,
          kecamatanName: citizen?.kecamatanName || 'Taliabu Barat',
          villageName: citizen?.villageName || 'Desa Wayo',
          cascadeStage: t.taskType === 'OUTREACH_CONTACT' ? 'Outreach & Kontak' : t.taskType === 'CLINICAL_CONFIRMATION' ? 'Konfirmasi Klinis' : 'Kontrol Berkala',
          gapCategory,
          daysStuck,
          primaryBarrier,
          lastOperationalEvent: `Tugas ${t.taskType} terbuka sejak ${t.createdAt.slice(0, 10)}`,
          recommendedDinkesAttention: isCapacity
            ? 'Koordinasi percepatan distribusi obat atau pembukaan sesi tambahan di Puskesmas.'
            : 'Fasilitasi jadwal jemputan kapal kader atau asistensi kontak nomor alternatif keluarga.',
        };
      });

    let filtered = items;
    if (filters?.facilityId && filters.facilityId !== 'ALL') {
      filtered = filtered.filter((i) => i.facilityId === filters.facilityId);
    }
    if (filters?.gapCategory && filters.gapCategory !== 'ALL') {
      filtered = filtered.filter((i) => i.gapCategory === filters.gapCategory);
    }
    if (filters?.cascadeStage && filters.cascadeStage !== 'ALL') {
      filtered = filtered.filter((i) => i.cascadeStage === filters.cascadeStage);
    }

    return filtered;
  },

  async sendAttentionSignal(params: {
    targetFacilityId: string;
    targetFacilityName: string;
    gapType: 'CAPACITY_GAP' | 'CITIZEN_ACCESS_GAP' | 'FOLLOW_UP_DELAY';
    affectedCount: number;
    period: string;
    message: string;
    creatorUser: User;
  }): Promise<PopulationAttentionSignal> {
    const signal = await populationAttentionRepo.create({
      targetFacilityId: params.targetFacilityId,
      targetFacilityName: params.targetFacilityName,
      gapType: params.gapType,
      affectedCount: params.affectedCount,
      period: params.period,
      message: params.message,
      createdByUserName: `${params.creatorUser.name} (${params.creatorUser.roleName})`,
    });

    await auditRepo.log({
      actorUserId: params.creatorUser.id,
      actorName: params.creatorUser.name,
      actorRole: params.creatorUser.roleId,
      action: 'EXPORT',
      entityType: 'POPULATION_REPORT',
      entityId: signal.id,
      targetLabel: `Sinyal Perhatian Dinkes -> ${params.targetFacilityName}`,
      description: `Kategori Hambatan: ${params.gapType} | Terdampak: ${params.affectedCount} kasus`,
      details: {
        gapType: params.gapType,
        affectedCount: params.affectedCount,
        message: params.message,
      },
    });

    return signal;
  },

  async getAllAttentionSignals(): Promise<PopulationAttentionSignal[]> {
    return populationAttentionRepo.getAll();
  },

  async acknowledgeSignal(id: string, user: User): Promise<PopulationAttentionSignal> {
    const updated = await populationAttentionRepo.updateStatus(id, 'ACKNOWLEDGED');
    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'UPDATE',
      entityType: 'POPULATION_REPORT',
      entityId: id,
      targetLabel: 'Konfirmasi Penerimaan Sinyal Perhatian',
      description: `Status diubah menjadi ACKNOWLEDGED oleh ${user.name}`,
      details: { status: 'ACKNOWLEDGED', acknowledgedBy: user.name },
    });
    return updated;
  },
};
