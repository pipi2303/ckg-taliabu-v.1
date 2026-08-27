import { RoleId, Status, User } from '../types';
import { userRepo } from '../repositories/userRepo';
import { auditRepo } from '../repositories/auditRepo';
import { permissionService } from './permissionService';

export const userService = {
  async getUsers(
    actor: User,
    options?: {
      roleId?: RoleId | 'ALL';
      facilityId?: string;
      status?: Status;
      kecamatanId?: string;
      desaId?: string;
      search?: string;
    },
  ): Promise<User[]> {
    let users = await userRepo.getUsers(options);

    // If actor is Kepala Puskesmas, limit to their own facility by default unless already filtered
    if (actor.roleId === 'KEPALA_PUSKESMAS') {
      users = users.filter((u) => u.facilityId === actor.facilityId || u.areaScopes.some((s) => actor.areaScopes.includes(s)));
    }

    return users;
  },

  async getUserById(id: string): Promise<User | undefined> {
    return userRepo.getUserById(id);
  },

  async createUser(
    actor: User,
    data: {
      name: string;
      username: string;
      email: string;
      phone: string;
      roleId: RoleId;
      facilityId: string;
      facilityName: string;
      areaScopes: string[];
      areaScopeNames: string[];
      villageAssignment?: string;
      villageAssignmentName?: string;
    },
  ): Promise<User> {
    // Role-based authorization check
    const check = permissionService.canManageUser(actor, data);
    if (!check.allowed) {
      throw new Error(check.reason || 'Anda tidak memiliki hak untuk menambahkan pengguna ini.');
    }

    // Validation: Kader requires Desa Binaan
    if (data.roleId === 'KADER' && !data.villageAssignment) {
      throw new Error('Penugasan Desa Binaan wajib diisi untuk peran Kader Kesehatan Desa.');
    }

    const roleDef = permissionService.getRoleDefinition(data.roleId);

    const newUser = await userRepo.createUser({
      ...data,
      roleName: roleDef.name,
      status: 'ACTIVE',
    });

    // Audit Event
    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'USER',
      entityId: newUser.id,
      targetLabel: `${newUser.name} (${newUser.roleName})`,
      facilityId: newUser.facilityId,
      facilityName: newUser.facilityName,
      purposeCode: 'USER_MANAGEMENT_CREATE',
      details: { roleId: newUser.roleId, username: newUser.username, areaScopes: newUser.areaScopeNames },
    });

    return newUser;
  },

  async updateUser(actor: User, id: string, updates: Partial<User>): Promise<User> {
    const existing = await userRepo.getUserById(id);
    if (!existing) throw new Error('Pengguna tidak ditemukan.');

    const check = permissionService.canManageUser(actor, existing);
    if (!check.allowed) {
      throw new Error(check.reason || 'Anda tidak memiliki hak untuk mengubah pengguna ini.');
    }

    // If role changed to KADER or role is KADER, ensure villageAssignment exists
    const nextRoleId = updates.roleId || existing.roleId;
    if (nextRoleId === 'KADER' && !updates.villageAssignment && !existing.villageAssignment) {
      throw new Error('Penugasan Desa Binaan wajib diisi untuk peran Kader Kesehatan.');
    }

    if (updates.roleId) {
      const roleDef = permissionService.getRoleDefinition(updates.roleId);
      updates.roleName = roleDef.name;
    }

    const updated = await userRepo.updateUser(id, updates);

    // Audit Event
    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: updated.id,
      targetLabel: `${updated.name} (${updated.roleName})`,
      facilityId: updated.facilityId,
      facilityName: updated.facilityName,
      purposeCode: 'USER_MANAGEMENT_UPDATE',
      details: { changes: Object.keys(updates) },
    });

    return updated;
  },

  async toggleUserStatus(actor: User, id: string, targetStatus: Status, reason?: string): Promise<User> {
    const existing = await userRepo.getUserById(id);
    if (!existing) throw new Error('Pengguna tidak ditemukan.');

    const check = permissionService.canManageUser(actor, existing);
    if (!check.allowed) {
      throw new Error(check.reason || 'Anda tidak memiliki hak untuk mengubah status pengguna ini.');
    }

    if (actor.id === id) {
      throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri.');
    }

    const updated = await userRepo.toggleStatus(id, targetStatus);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: targetStatus === 'ACTIVE' ? 'REACTIVATE' : 'DEACTIVATE',
      entityType: 'USER',
      entityId: updated.id,
      targetLabel: `${updated.name} (${updated.roleName}) - Status: ${targetStatus}`,
      facilityId: updated.facilityId,
      facilityName: updated.facilityName,
      purposeCode: 'USER_STATUS_CHANGE',
      details: { previousStatus: existing.status, newStatus: targetStatus, reason: reason || 'Perubahan status operasional' },
    });

    return updated;
  },
};
