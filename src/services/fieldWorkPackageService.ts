import {
  FieldWorkPackage,
  KaderAssignmentPayload,
  User,
} from '../types';
import { rawStorage } from '../repositories/storage';
import { assertKaderPayloadSensitivity } from './kaderPayloadSecurityService';
import { kaderStorageRepo } from '../repositories/kaderStorageRepo';
import { auditRepo } from '../repositories/auditRepo';

export interface PackageMetadataPreview {
  assignmentCount: number;
  estimatedSizeBytes: number;
  estimatedSizeKb: number;
  expiresAt: string;
  ruleVersion: string;
  villageName: string;
  availableStorageMb: number;
  storageSufficient: boolean;
}

export const fieldWorkPackageService = {
  /**
   * Generates a preview of the FieldWorkPackage BEFORE downloading,
   * showing exact assignment count, size in KB, and validity.
   */
  async getPackagePreview(user: User): Promise<PackageMetadataPreview> {
    const rawAssignments = await this.buildSanitizedAssignments(user);
    const mockPackage: FieldWorkPackage = {
      id: `pkg-preview-${user.id}`,
      assignedUserId: user.id,
      villageId: user.villageAssignment || user.areaScopes[0] || 'des-1',
      villageName: user.villageAssignmentName || user.areaScopeNames[0] || 'Desa Binaan',
      downloadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ruleVersion: 'v1.1.0-CKG-TALIABU-2026',
      payloadSizeBytes: 0,
      assignmentCount: rawAssignments.length,
      assignments: rawAssignments,
    };

    // Calculate serialized byte size
    const jsonStr = JSON.stringify(mockPackage);
    const sizeBytes = new Blob([jsonStr]).size;
    const sizeKb = Math.round((sizeBytes / 1024) * 10) / 10;

    // Check simulated device storage
    const deviceState = kaderStorageRepo.getDeviceState();
    let availableMb = 128;
    let sufficient = true;

    if (deviceState.simulatedStorageMode === 'FULL') {
      availableMb = 0.05; // 50 KB available
      sufficient = false;
    } else if (deviceState.simulatedStorageMode === 'NEARLY_FULL') {
      availableMb = 0.8;
      sufficient = sizeKb < 800;
    }

    const validityDays = deviceState.packageValidityDays || 7;
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    return {
      assignmentCount: rawAssignments.length,
      estimatedSizeBytes: sizeBytes,
      estimatedSizeKb: sizeKb,
      expiresAt,
      ruleVersion: 'v1.1.0-CKG-TALIABU-2026',
      villageName: mockPackage.villageName,
      availableStorageMb: availableMb,
      storageSufficient: sufficient,
    };
  },

  /**
   * Builds sanitized S2 assignment items from CareTasks and Citizens.
   * STRICT: NEVER includes clinical values (blood pressure, glucose, BMI, risk color, etc.).
   */
  async buildSanitizedAssignments(user: User): Promise<KaderAssignmentPayload[]> {
    const userVillageId = user.villageAssignment || user.areaScopes[0] || 'des-1';
    const allCitizens = rawStorage.getCitizens();
    const allCareTasks = rawStorage.getCareTasks();
    const allDesa = rawStorage.getDesa();
    const allFacilities = rawStorage.getFacilities();

    // Map desa and facilities
    const desaMap = new Map(allDesa.map((d) => [d.id, d.name]));
    const facilityMap = new Map(allFacilities.map((f) => [f.id, f.name]));
    const citizenMap = new Map(allCitizens.map((c) => [c.id, c]));

    // Filter tasks: Must belong to user's assigned village, and status OPEN/ASSIGNED/IN_PROGRESS
    // If assignedToUserId matches user.id OR unassigned in this village
    const eligibleTasks = allCareTasks.filter((t) => {
      const isStatusActive = t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS';
      if (!isStatusActive) return false;

      const citizen = citizenMap.get(t.citizenId);
      if (!citizen) return false;

      // Area scope hard lock: must match user's village
      const citizenVillage = citizen.villageId;
      const isVillageMatch = citizenVillage === userVillageId || user.areaScopes.includes(citizenVillage);
      if (!isVillageMatch) return false;

      // Assigned to this user OR unassigned field visit
      if (t.assignedToUserId && t.assignedToUserId !== user.id) {
        return false;
      }

      return true;
    });

    // Construct pure S2 payloads
    const sanitizedAssignments: KaderAssignmentPayload[] = eligibleTasks.map((task, index) => {
      const citizen = citizenMap.get(task.citizenId);
      const villageName = (citizen ? desaMap.get(citizen.villageId) : '') || user.villageAssignmentName || 'Desa Bobong';
      const facilityName = task.assignedFacilityName || (task.assignedFacilityId ? facilityMap.get(task.assignedFacilityId) : '') || 'Puskesmas Bobong';

      // Age calculation
      let age: number | undefined = undefined;
      if (citizen?.birthDate) {
        const birthYear = new Date(citizen.birthDate).getFullYear();
        age = new Date().getFullYear() - birthYear;
      }

      // Safe route and action text (PURE S2 - NO DIAGNOSIS / NO CLINICAL VALUES)
      const actionText = task.actionText || 'Kunjungan tindak lanjut pemeriksaan kesehatan terpadu';
      const dusun = index % 2 === 0 ? 'Dusun I - RT 01' : 'Dusun II - RT 03';
      const addressText = citizen?.addressText || `${dusun}, ${villageName}`;

      const payload: KaderAssignmentPayload = {
        taskId: task.id,
        citizenId: task.citizenId,
        citizenName: citizen?.fullName || task.citizenName || 'Warga CKG',
        age,
        sex: citizen?.sex === 'MALE' ? 'L' : citizen?.sex === 'FEMALE' ? 'P' : undefined,
        villageName,
        addressText,
        actionText,
        dueAt: task.dueAt || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        facilityName,
        serviceDays: ['Senin - Kamis (08:00 - 13:00)', 'Jumat (08:00 - 11:00)'],
        routeNote: index % 3 === 0 ? 'Rumah dekat jembatan kayu samping dermaga' : 'Dekat pos ronda / masjid desa',
        previousFieldVisitSummary: task.contactAttemptsCount > 0 ? `Sudah dihubungi ${task.contactAttemptsCount}x via kontak sebelumnya` : undefined,
        urgentOperationalFlag: task.isCritical || task.priorityScore >= 80,
        serverPriorityOrder: index + 1,
        dusunOrHamlet: dusun,
      };

      return payload;
    });

    // Sort by server priority: urgent first, then priority order
    sanitizedAssignments.sort((a, b) => {
      if (a.urgentOperationalFlag && !b.urgentOperationalFlag) return -1;
      if (!a.urgentOperationalFlag && b.urgentOperationalFlag) return 1;
      return a.serverPriorityOrder - b.serverPriorityOrder;
    });

    return sanitizedAssignments;
  },

  /**
   * Generates, verifies, and delivers the full FieldWorkPackage with S2 sensitivity assertion.
   * If any S3/S4 field is detected, generation strictly fails.
   */
  async generateAndActivatePackage(user: User): Promise<FieldWorkPackage> {
    // Check storage
    const preview = await this.getPackagePreview(user);
    if (!preview.storageSufficient) {
      throw new Error('Ruang penyimpanan perangkat tidak cukup untuk mengunduh paket baru.');
    }

    const assignments = await this.buildSanitizedAssignments(user);

    const newPackage: FieldWorkPackage = {
      id: `pkg-${user.id}-${Date.now()}`,
      assignedUserId: user.id,
      villageId: user.villageAssignment || user.areaScopes[0] || 'des-1',
      villageName: preview.villageName,
      downloadedAt: new Date().toISOString(),
      expiresAt: preview.expiresAt,
      ruleVersion: 'v1.1.0-CKG-TALIABU-2026',
      payloadSizeBytes: preview.estimatedSizeBytes,
      assignmentCount: assignments.length,
      assignments,
    };

    // HARD LOCK: Assert S2 Sensitivity Boundary
    assertKaderPayloadSensitivity(newPackage);

    // Save atomic package (preserves existing unsynced queue!)
    kaderStorageRepo.setActivePackage(newPackage);

    // Save offline session
    kaderStorageRepo.setOfflineSession({
      userId: user.id,
      villageId: newPackage.villageId,
      villageName: newPackage.villageName,
      packageId: newPackage.id,
      sessionIssuedAt: new Date().toISOString(),
      sessionExpiresAt: newPackage.expiresAt,
      offlineAllowed: true,
    });

    // Audit log
    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: 'KADER',
      action: 'PACKAGE_DOWNLOADED',
      entityType: 'FIELD_WORK_PACKAGE',
      entityId: newPackage.id,
      description: `Paket kerja kader berhasil diunduh (${assignments.length} sasaran, ${preview.estimatedSizeKb} KB) untuk ${newPackage.villageName}`,
      details: {
        packageId: newPackage.id,
        assignmentCount: assignments.length,
        sizeKb: preview.estimatedSizeKb,
        expiresAt: newPackage.expiresAt,
      },
    });

    return newPackage;
  },
};
