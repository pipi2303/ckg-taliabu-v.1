import { ClassificationReviewItem, User } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';
import { auditService } from '../services/auditService';

export const classificationReviewRepo = {
  async getAll(): Promise<ClassificationReviewItem[]> {
    await simulateNetworkDelay();
    return rawStorage.getClassificationReviews();
  },

  async resolve(
    id: string,
    resolutionNotes: string,
    actor: User
  ): Promise<ClassificationReviewItem> {
    await simulateNetworkDelay();
    const existing = rawStorage.getClassificationReviews();
    const item = existing.find((r) => r.id === id);

    if (!item) {
      throw new Error(`Item review dengan ID ${id} tidak ditemukan.`);
    }

    const updatedItem: ClassificationReviewItem = {
      ...item,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolvedByUserName: actor.name,
      resolutionNotes,
    };

    const updatedList = existing.map((r) => (r.id === id ? updatedItem : r));
    rawStorage.setClassificationReviews(updatedList);

    await auditService.log(actor, 'RESOLVE_REVIEW', 'CLASSIFICATION_REVIEW', {
      targetId: item.id,
      targetLabel: `Review ${item.issueType} - ${item.citizenName}`,
      citizenId: item.citizenId,
      purposeCode: 'CLINICAL_CLASSIFICATION_REVIEW_RESOLUTION',
      notes: resolutionNotes,
      details: {
        issueType: item.issueType,
        domain: item.domain,
        citizenNik: item.citizenNik,
      },
    });

    return updatedItem;
  },
};
