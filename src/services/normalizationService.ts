import { NormalizedCkgRecord, NormalizedScreeningValue, VenueType } from '../types';

export const normalizationService = {
  /**
   * Normalizes raw CKG source record from file/API into standard internal NormalizedCkgRecord
   */
  normalizeRecord(raw: any, sourceSystem: string = 'SSI-ASIK-SIMULATION'): NormalizedCkgRecord {
    // 1. Clean NIK
    const rawNik = String(raw.source_nik || raw.nik || raw.NIK || '').trim();
    const nik = rawNik.length >= 10 ? rawNik.replace(/\D/g, '') : undefined;

    // 2. Clean Name
    const rawName = String(raw.source_name || raw.nama || raw.fullName || raw.nama_lengkap || '').trim();
    const fullName = rawName
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // 3. Normalize Date of Birth
    let birthDate = String(raw.dob || raw.birthDate || raw.tgl_lahir || '').trim();
    if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY to YYYY-MM-DD
        birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // 4. Normalize Sex
    const rawSex = String(raw.sex || raw.jenis_kelamin || raw.gender || '').toUpperCase();
    const sex: 'MALE' | 'FEMALE' =
      rawSex.startsWith('L') || rawSex === 'MALE' || rawSex === 'PRIA' ? 'MALE' : 'FEMALE';

    // 5. Screening date
    const screeningDate =
      raw.screeningDate || raw.exam_date || raw.tgl_skrining || new Date().toISOString().slice(0, 10);

    // 6. Venue
    const rawVenue = String(raw.venue || raw.lokasi || 'FACILITY').toUpperCase();
    const venueType: VenueType =
      rawVenue.includes('POSYANDU')
        ? 'POSYANDU'
        : rawVenue.includes('SEKOLAH') || rawVenue.includes('SCHOOL')
        ? 'SCHOOL'
        : rawVenue.includes('KOMUNITAS') || rawVenue.includes('COMMUNITY')
        ? 'COMMUNITY'
        : 'FACILITY';

    // 7. Results normalization with physiological anomaly flags
    const results: NormalizedScreeningValue[] = [];

    const systolic = Number(raw.systolic || raw.tensi_sistole || raw.systole);
    if (!isNaN(systolic) && systolic > 0) {
      results.push({
        measureCode: 'BP_SYSTOLIC',
        measureName: 'Tekanan Darah Sistolik',
        valueNumeric: systolic,
        unit: 'mmHg',
        isAnomalous: systolic > 260 || systolic < 50,
      });
    }

    const diastolic = Number(raw.diastolic || raw.tensi_diastole || raw.diastole);
    if (!isNaN(diastolic) && diastolic > 0) {
      results.push({
        measureCode: 'BP_DIASTOLIC',
        measureName: 'Tekanan Darah Diastolik',
        valueNumeric: diastolic,
        unit: 'mmHg',
        isAnomalous: diastolic > 160 || diastolic < 30,
      });
    }

    const glucose = Number(raw.glucose || raw.gula_darah || raw.gds);
    if (!isNaN(glucose) && glucose > 0) {
      results.push({
        measureCode: 'RANDOM_GLUCOSE',
        measureName: 'Gula Darah Sewaktu',
        valueNumeric: glucose,
        unit: 'mg/dL',
        isAnomalous: glucose > 600 || glucose < 30,
      });
    }

    const weight = Number(raw.weight || raw.berat_badan || raw.bb);
    if (!isNaN(weight) && weight > 0) {
      results.push({
        measureCode: 'WEIGHT',
        measureName: 'Berat Badan',
        valueNumeric: weight,
        unit: 'kg',
        isAnomalous: weight > 250 || weight < 10,
      });
    }

    const height = Number(raw.height || raw.tinggi_badan || raw.tb);
    if (!isNaN(height) && height > 0) {
      results.push({
        measureCode: 'HEIGHT',
        measureName: 'Tinggi Badan',
        valueNumeric: height,
        unit: 'cm',
        isAnomalous: height > 230 || height < 50,
      });
    }

    if (weight > 0 && height > 0) {
      const heightInM = height / 100;
      const bmi = Number((weight / (heightInM * heightInM)).toFixed(2));
      results.push({
        measureCode: 'BMI',
        measureName: 'Indeks Massa Tubuh',
        valueNumeric: bmi,
        unit: 'kg/m²',
        isAnomalous: bmi > 60 || bmi < 10,
      });
    }

    const waist = Number(raw.waist || raw.lingkar_perut || raw.lp);
    if (!isNaN(waist) && waist > 0) {
      results.push({
        measureCode: 'WAIST_CIRCUMFERENCE',
        measureName: 'Lingkar Perut',
        valueNumeric: waist,
        unit: 'cm',
        isAnomalous: waist > 180 || waist < 30,
      });
    }

    const isComplete = results.some((r) => r.measureCode === 'BP_SYSTOLIC') &&
      results.some((r) => r.measureCode === 'RANDOM_GLUCOSE' || r.measureCode === 'BMI');

    return {
      sourceSystem,
      sourceRecordId: String(raw.sourceRecordId || raw.id || `SRC-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
      nik,
      fullName,
      birthDate,
      sex,
      phone: raw.phone || raw.telepon || raw.no_hp,
      address: raw.address || raw.alamat,
      villageCode: raw.villageCode || raw.kode_desa || raw.village,
      villageName: raw.villageName || raw.desa,
      facilityCode: raw.facilityCode || raw.kode_faskes || raw.facility,
      facilityName: raw.facilityName || raw.faskes,
      screeningDate,
      venueType,
      isComplete,
      results,
    };
  },
};
