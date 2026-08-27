import { facilityRepo } from '../repositories/facilityRepo';
import { TALIABU_FACILITY_DETAILS, TaliabuFacilityDetail } from '../mock/initialCitizenData';

export const citizenFacilityService = {
  /**
   * Fetches comprehensive facility and accessibility guidance
   */
  async getFacilityInfo(facilityId: string): Promise<TaliabuFacilityDetail> {
    const detail = TALIABU_FACILITY_DETAILS[facilityId];
    if (detail) return detail;

    // Fallback to basic repo facility
    const facility = await facilityRepo.getById(facilityId);
    if (facility) {
      return {
        id: facility.id,
        name: facility.name,
        type: facility.type === 'PUSKESMAS' ? 'Puskesmas FKTP' : 'Fasilitas Kesehatan',
        address: facility.address || 'Kabupaten Pulau Taliabu, Maluku Utara',
        phone: facility.phone || '0812-4001-8899',
        serviceDays: 'Senin s/d Sabtu',
        serviceHours: '08:00 - 14:00 WIT',
        whatToBring: [
          'KTP / Kartu Keluarga (identitas)',
          'Kartu BPJS Kesehatan / KIS (jika ada)',
          'Obat yang sedang diminum saat ini',
        ],
        transportNotes:
          'Dapat diakses melalui jalur transportasi darat atau perahu nelayan setempat.',
      };
    }

    return TALIABU_FACILITY_DETAILS['FASKES-PKM-01'];
  },
};
