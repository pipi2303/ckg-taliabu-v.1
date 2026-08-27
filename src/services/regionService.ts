import { Desa, Kecamatan, Status, User } from '../types';
import { regionRepo } from '../repositories/regionRepo';
import { auditRepo } from '../repositories/auditRepo';
import { permissionService } from './permissionService';

export const regionService = {
  async getKecamatanList(options?: { status?: Status; search?: string }): Promise<Kecamatan[]> {
    return regionRepo.getKecamatanList(options);
  },

  async getDesaList(options?: { kecamatanId?: string; status?: Status; search?: string }): Promise<Desa[]> {
    return regionRepo.getDesaList(options);
  },

  async createKecamatan(actor: User, data: { code: string; name: string }): Promise<Kecamatan> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang menambah wilayah kecamatan.');
    }

    const newKec = await regionRepo.createKecamatan(data);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'REGION_KECAMATAN',
      entityId: newKec.id,
      targetLabel: `Kecamatan ${newKec.name} (${newKec.code})`,
      purposeCode: 'REGION_MASTER_CREATE',
      details: { code: newKec.code, name: newKec.name },
    });

    return newKec;
  },

  async updateKecamatan(actor: User, id: string, updates: Partial<Kecamatan>): Promise<Kecamatan> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah data kecamatan.');
    }

    const updated = await regionRepo.updateKecamatan(id, updates);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'REGION_KECAMATAN',
      entityId: updated.id,
      targetLabel: `Kecamatan ${updated.name} (${updated.code})`,
      purposeCode: 'REGION_MASTER_UPDATE',
      details: { updates },
    });

    return updated;
  },

  async toggleKecamatanStatus(actor: User, id: string, targetStatus: Status): Promise<Kecamatan> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah status aktif kecamatan.');
    }

    const updated = await regionRepo.toggleKecamatanStatus(id, targetStatus);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: targetStatus === 'ACTIVE' ? 'REACTIVATE' : 'DEACTIVATE',
      entityType: 'REGION_KECAMATAN',
      entityId: updated.id,
      targetLabel: `Kecamatan ${updated.name} - Status: ${targetStatus}`,
      purposeCode: 'REGION_STATUS_CHANGE',
      details: { status: targetStatus },
    });

    return updated;
  },

  async createDesa(
    actor: User,
    data: {
      code: string;
      name: string;
      kecamatanId: string;
      kecamatanName: string;
      puskesmasId: string;
      puskesmasName: string;
    },
  ): Promise<Desa> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang menambah data desa.');
    }

    const newDesa = await regionRepo.createDesa(data);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'REGION_DESA',
      entityId: newDesa.id,
      targetLabel: `Desa ${newDesa.name} (Kec. ${newDesa.kecamatanName})`,
      purposeCode: 'VILLAGE_MASTER_CREATE',
      details: { code: newDesa.code, puskesmas: newDesa.puskesmasName },
    });

    return newDesa;
  },

  async updateDesa(actor: User, id: string, updates: Partial<Desa>): Promise<Desa> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah data desa.');
    }

    const updated = await regionRepo.updateDesa(id, updates);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'REGION_DESA',
      entityId: updated.id,
      targetLabel: `Desa ${updated.name} (${updated.code})`,
      purposeCode: 'VILLAGE_MASTER_UPDATE',
      details: { updates },
    });

    return updated;
  },

  async toggleDesaStatus(actor: User, id: string, targetStatus: Status): Promise<Desa> {
    if (!permissionService.canManageRegions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah status aktif desa.');
    }

    const updated = await regionRepo.toggleDesaStatus(id, targetStatus);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: targetStatus === 'ACTIVE' ? 'REACTIVATE' : 'DEACTIVATE',
      entityType: 'REGION_DESA',
      entityId: updated.id,
      targetLabel: `Desa ${updated.name} - Status: ${targetStatus}`,
      purposeCode: 'VILLAGE_STATUS_CHANGE',
      details: { status: targetStatus },
    });

    return updated;
  },
};
