import { RuleVersion, RuleVersionStatus, User } from '../types';
import { ruleVersionRepo } from '../repositories/ruleVersionRepo';
import { auditRepo } from '../repositories/auditRepo';
import { permissionService } from './permissionService';

export const ruleVersionService = {
  async getRuleVersions(options?: { status?: RuleVersionStatus | 'ALL'; search?: string }): Promise<RuleVersion[]> {
    return ruleVersionRepo.getRuleVersions(options);
  },

  async createDraft(
    actor: User,
    data: {
      version: string;
      sourceDocument: string;
      effectiveDate: string;
      notes: string;
      rulesCount: number;
    },
  ): Promise<RuleVersion> {
    if (!permissionService.canManageRuleVersions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang membuat draft versi aturan klinis.');
    }

    const draft = await ruleVersionRepo.createDraft(data);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'CREATE',
      entityType: 'RULE_VERSION',
      entityId: draft.id,
      targetLabel: `Draft Versi Aturan: ${draft.version}`,
      purposeCode: 'RULE_VERSION_DRAFT',
      details: { version: draft.version, source: draft.sourceDocument },
    });

    return draft;
  },

  async submitReview(actor: User, id: string): Promise<RuleVersion> {
    if (!permissionService.canManageRuleVersions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mengajukan review aturan.');
    }

    const updated = await ruleVersionRepo.submitReview(id);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'SUBMIT_REVIEW',
      entityType: 'RULE_VERSION',
      entityId: updated.id,
      targetLabel: `Pengajuan Review Aturan: ${updated.version}`,
      purposeCode: 'RULE_VERSION_REVIEW',
      details: { version: updated.version },
    });

    return updated;
  },

  async approve(actor: User, id: string): Promise<RuleVersion> {
    if (!permissionService.canApproveRuleVersions(actor)) {
      throw new Error('Hanya Kepala Dinas Kesehatan atau Pejabat Berwenang yang dapat menyetujui aturan klinis.');
    }

    const approved = await ruleVersionRepo.approve(id, `${actor.name} (${actor.roleName})`);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'APPROVE',
      entityType: 'RULE_VERSION',
      entityId: approved.id,
      targetLabel: `Persetujuan Versi Aturan: ${approved.version}`,
      purposeCode: 'RULE_VERSION_APPROVAL',
      details: { approvedBy: actor.name, version: approved.version },
    });

    return approved;
  },

  async publish(actor: User, id: string): Promise<RuleVersion> {
    if (!permissionService.canManageRuleVersions(actor)) {
      throw new Error('Hanya Administrator Dinas Kesehatan yang berwenang mempublikasikan versi aturan klinis.');
    }

    const published = await ruleVersionRepo.publish(id, `${actor.name} (${actor.roleName})`);

    await auditRepo.log({
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.roleId,
      action: 'PUBLISH',
      entityType: 'RULE_VERSION',
      entityId: published.id,
      targetLabel: `Publikasi Versi Aturan Aktif: ${published.version}`,
      purposeCode: 'RULE_VERSION_PUBLISH',
      details: {
        publishedBy: actor.name,
        version: published.version,
        effectiveDate: published.effectiveDate,
        checksum: published.checksum,
        notice: 'A new rule version affects future classifications only. Historical classifications are not recalculated.',
      },
    });

    return published;
  },
};
