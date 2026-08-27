import { FacilityType, HealthFacility, Status, User } from '../types';
import { facilityRepo } from '../repositories/facilityRepo';
import { auditRepo } from '../repositories/auditRepo';
import { permissionService } from './permissionService';

export const facilityService = {
  async getFacilities(
    options?: {
      type?: FacilityType | 'ALL';
      status?: Status;
      kecamatanId?: string;
      search?: string;
    },
  ): Promise<HealthFacility[]> {
    return facilityRepo.getFacilities(options);
  },

  async getFacilityById(id: string): Promise<HealthFacility | undefined> {
    return facilityRepo.getFacilityById(id);
  },

  async createFacility(
    actor: User,
    data: Omit<HealthFacility, 'id' | 'status' | 'updatedAt' | 'connectedFacilitiesCount' | 'activeUsersCount'>,
  ): Promise<HealthFacility> {
    if (!permissionService.canManageFacility(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang menambah fasilitas kesehatan.');
    }

    const newFacility = await facilityRepo.createFacility(data);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'HEALTH_FACILITY',
      entityId: newFacility.id,
      targetLabel: `${newFacility.name} (${newFacility.type})`,
      facilityId: newFacility.id,
      facilityName: newFacility.name,
      purposeCode: 'FACILITY_REGISTRATION',
      details: { type: newFacility.type, kecamatan: newFacility.kecamatanName, desa: newFacility.desaName },
    });

    return newFacility;
  },

  async updateFacility(actor: User, id: string, updates: Partial<HealthFacility>): Promise<HealthFacility> {
    if (!permissionService.canManageFacility(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah fasilitas kesehatan.');
    }

    const updated = await facilityRepo.updateFacility(id, updates);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'HEALTH_FACILITY',
      entityId: updated.id,
      targetLabel: `${updated.name} (${updated.type})`,
      facilityId: updated.id,
      facilityName: updated.name,
      purposeCode: 'FACILITY_METADATA_UPDATE',
      details: { updatedFields: Object.keys(updates) },
    });

    return updated;
  },

  async toggleStatus(actor: User, id: string, targetStatus: Status, reason?: string): Promise<HealthFacility> {
    if (!permissionService.canManageFacility(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengubah status fasilitas kesehatan.');
    }

    const updated = await facilityRepo.toggleStatus(id, targetStatus);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: targetStatus === 'ACTIVE' ? 'REACTIVATE' : 'DEACTIVATE',
      entityType: 'HEALTH_FACILITY',
      entityId: updated.id,
      targetLabel: `${updated.name} (${updated.type}) - Status: ${targetStatus}`,
      facilityId: updated.id,
      facilityName: updated.name,
      purposeCode: 'FACILITY_STATUS_CHANGE',
      details: { targetStatus, reason: reason || 'Pembaruan status operasional faskes' },
    });

    return updated;
  },
};
