import { citizenRepo } from '../repositories/citizenRepo';
import { careTaskRepo } from '../repositories/careTaskRepo';
import { appointmentRepo } from '../repositories/appointmentRepo';
import { screeningRepo } from '../repositories/screeningRepo';
import { consentRepo } from '../repositories/consentRepo';
import { citizenLocalCacheRepo } from '../repositories/citizenLocalCacheRepo';
import { citizenStatusTranslationService } from './citizenStatusTranslationService';
import { TALIABU_FACILITY_DETAILS } from '../mock/initialCitizenData';
import {
  CitizenCompanionProfileDTO,
  CitizenHealthValueDTO,
} from '../types';

export const citizenProfileService = {
  /**
   * Fetches full citizen companion profile DTO
   */
  async getProfile(citizenId: string): Promise<CitizenCompanionProfileDTO | null> {
    const citizen = await citizenRepo.getById(citizenId);
    if (!citizen) return null;

    const allTasks = await careTaskRepo.getByCitizenId(citizenId);
    // Filter active tasks
    const activeTasks = allTasks.filter(
      (t) => t.status !== 'CLOSED' && t.status !== 'CANCELLED'
    );

    const appointments = await appointmentRepo.getByCitizenId(citizenId);

    const activeConsent = await consentRepo.getByCitizenId(citizenId);

    const profile = citizenStatusTranslationService.buildProfileDTO(
      citizen,
      activeTasks,
      appointments,
      !!activeConsent,
      activeConsent?.consentTextVersion,
      activeConsent?.grantedAt
    );

    // Fetch observations for offline cache
    const observations = await screeningRepo.getObservationsByCitizenId(citizenId);
    const healthValues = citizenStatusTranslationService.translateObservations(observations);

    // Save to offline cache
    const facilityDetail =
      TALIABU_FACILITY_DETAILS[citizen.facilityId] || TALIABU_FACILITY_DETAILS['FASKES-PKM-01'];
    await citizenLocalCacheRepo.saveCache(citizenId, {
      profile,
      values: healthValues,
      facilityInfo: {
        id: facilityDetail.id,
        name: facilityDetail.name,
        address: facilityDetail.address,
        phone: facilityDetail.phone,
        serviceDays: facilityDetail.serviceDays,
        serviceHours: facilityDetail.serviceHours,
        whatToBring: facilityDetail.whatToBring,
        transportNotes: facilityDetail.transportNotes,
      },
      cachedAt: new Date().toISOString(),
    });

    return profile;
  },

  /**
   * Fetches citizen-safe health examination values (provenance included, no CRS/internal codes)
   */
  async getHealthValues(citizenId: string): Promise<CitizenHealthValueDTO[]> {
    const observations = await screeningRepo.getObservationsByCitizenId(citizenId);
    return citizenStatusTranslationService.translateObservations(observations);
  },
};
