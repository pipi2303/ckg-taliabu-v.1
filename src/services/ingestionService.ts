import {
  ImportFileHistory,
  IngestionFailureType,
  IngestionRun,
  NormalizedCkgRecord,
  User,
} from '../types';
import { rawStorage } from '../repositories/storage';
import { ingestionRepo } from '../repositories/ingestionRepo';
import { normalizationService } from './normalizationService';
import { mpiService } from './mpiService';
import { citizenRepo } from '../repositories/citizenRepo';
import { screeningRepo } from '../repositories/screeningRepo';
import { dataQualityRepo } from '../repositories/dataQualityRepo';
import { auditService } from './auditService';

export interface IngestionExecutionResult {
  runId: string;
  sourceSystem: string;
  receivedCount: number;
  acceptedCount: number;
  qualityQueueCount: number;
  aggregateOnlyCount: number;
  rejectedCount: number;
  status: 'SUCCESS' | 'PARTIAL_FAILED' | 'FAILED';
  errorType?: IngestionFailureType;
  errorMessage?: string;
  watermarkAdvanced: boolean;
}

export const ingestionService = {
  /**
   * Main Ingestion Pipeline: Source -> Ingestion -> Normalization -> MPI -> Processing Basis -> 3 Destinations
   */
  async processBatch(
    records: any[],
    sourceSystem: string,
    facilityId: string,
    facilityName: string,
    user: User,
    simulatedError?: IngestionFailureType
  ): Promise<IngestionExecutionResult> {
    const existingRuns = await ingestionRepo.getRuns();
    const isRunning = existingRuns.some((r) => r.status === 'RUNNING');
    if (isRunning) {
      throw new Error('Proses penarikan data sedang berlangsung. Tidak dapat memulai proses penarikan paralel.');
    }

    const watermarkFrom = await ingestionRepo.getWatermark(facilityId);
    const now = new Date().toISOString();

    // 1. Create Ingestion Run Record with status RUNNING
    const run = await ingestionRepo.createRun({
      sourceSystem,
      facilityId,
      facilityName,
      startedAt: now,
      watermarkFrom,
      receivedCount: records.length,
      acceptedCount: 0,
      rejectedCount: 0,
      qualityQueueCount: 0,
      aggregateOnlyCount: 0,
      status: 'RUNNING',
    });

    // Handle Simulated Failure Types
    if (simulatedError) {
      if (simulatedError === 'NETWORK_ERROR') {
        await ingestionRepo.updateRun(run.id, {
          completedAt: new Date().toISOString(),
          status: 'FAILED',
          errorType: 'NETWORK_ERROR',
          errorMessage: 'Koneksi jaringan terputus (Network Connection Reset). Watermark tidak dimajukan.',
        });
        await auditService.log(user, 'CREATE', 'INGESTION_RUN', {
          targetLabel: `Ingestion Gagal [${simulatedError}]`,
          purposeCode: 'INT_FAIL_SIMULATION',
          details: { errorType: simulatedError, facilityId },
        });
        return {
          runId: run.id,
          sourceSystem,
          receivedCount: records.length,
          acceptedCount: 0,
          qualityQueueCount: 0,
          aggregateOnlyCount: 0,
          rejectedCount: records.length,
          status: 'FAILED',
          errorType: 'NETWORK_ERROR',
          errorMessage: 'Koneksi jaringan terputus (Network Connection Reset). Watermark tidak dimajukan.',
          watermarkAdvanced: false,
        };
      }

      if (simulatedError === 'CREDENTIAL_REJECTED') {
        await ingestionRepo.updateRun(run.id, {
          completedAt: new Date().toISOString(),
          status: 'FAILED',
          errorType: 'CREDENTIAL_REJECTED',
          errorMessage: 'Kredensial integrasi faskes ditolak oleh API Kemenkes (HTTP 401 Unauthorized). Hubungi Administrator.',
        });
        return {
          runId: run.id,
          sourceSystem,
          receivedCount: records.length,
          acceptedCount: 0,
          qualityQueueCount: 0,
          aggregateOnlyCount: 0,
          rejectedCount: records.length,
          status: 'FAILED',
          errorType: 'CREDENTIAL_REJECTED',
          errorMessage: 'Kredensial ditolak (401 Unauthorized). Ingestion dihentikan untuk faskes ini.',
          watermarkAdvanced: false,
        };
      }

      if (simulatedError === 'PAYLOAD_SCHEMA_CHANGED') {
        await ingestionRepo.updateRun(run.id, {
          completedAt: new Date().toISOString(),
          status: 'FAILED',
          errorType: 'PAYLOAD_SCHEMA_CHANGED',
          errorMessage: 'Struktur payload sumber data berubah drastis (Schema Mismatch). Proses dihentikan demi menjaga integritas basis data.',
        });
        return {
          runId: run.id,
          sourceSystem,
          receivedCount: records.length,
          acceptedCount: 0,
          qualityQueueCount: 0,
          aggregateOnlyCount: 0,
          rejectedCount: records.length,
          status: 'FAILED',
          errorType: 'PAYLOAD_SCHEMA_CHANGED',
          errorMessage: 'Struktur data sumber berubah. Proses import dihentikan agar data lama tetap aman.',
          watermarkAdvanced: false,
        };
      }
    }

    // 2. Execute pipeline for each record
    let acceptedCount = 0;
    let qualityQueueCount = 0;
    let aggregateOnlyCount = 0;
    let rejectedCount = 0;

    const existingSessions = rawStorage.getScreeningSessions();

    for (const raw of records) {
      try {
        // Step 1: Normalization
        const normalized = normalizationService.normalizeRecord(raw, sourceSystem);

        // Step 2: Idempotency check on sourceRecordId
        const isAlreadyIngested = existingSessions.some(
          (s) => s.sourceSystem === sourceSystem && s.sourceRecordId === normalized.sourceRecordId
        );

        if (isAlreadyIngested) {
          // Idempotent: record already processed, skip duplicate insertion
          acceptedCount++;
          continue;
        }

        // Step 3: Identity Matching (MPI) & Consent Gate
        const mpiResult = await mpiService.resolveIdentity(normalized);

        if (mpiResult.destination === 'REGISTRY') {
          let citizenId = mpiResult.matchedCitizen?.id;

          // If Level 5 (New Identity), create citizen in registry
          if (!citizenId) {
            const villages = rawStorage.getDesa();
            const matchingVillage = villages.find(
              (v) => v.code === normalized.villageCode || v.name.toLowerCase() === (normalized.villageName || '').toLowerCase()
            );

            const newCitizen = await citizenRepo.create(
              {
                fullName: normalized.fullName,
                birthDate: normalized.birthDate || '1980-01-01',
                sex: normalized.sex,
                phonePrimary: normalized.phone,
                addressText: normalized.address || (matchingVillage ? `Desa ${matchingVillage.name}` : undefined),
                villageId: matchingVillage?.id || 'DESA-820801-001',
                villageName: matchingVillage?.name || 'Bobong',
                kecamatanId: matchingVillage?.kecamatanId || 'KEC-820801',
                kecamatanName: matchingVillage?.kecamatanName || 'Taliabu Barat',
                facilityId: facilityId || 'FASKES-PKM-01',
                facilityName: facilityName || 'Puskesmas Bobong',
                vitalStatus: 'ALIVE',
              },
              normalized.nik
            );
            citizenId = newCitizen.id;
          }

          // Ingest Screening Session and Results
          const screeningResultsData = normalized.results.map((r) => ({
            measureCode: r.measureCode,
            measureName: r.measureName,
            valueNumeric: r.valueNumeric,
            valueCode: r.valueCode,
            unit: r.unit,
            measuredAt: normalized.screeningDate,
            sequenceInSession: 1,
            isAnomalous: r.isAnomalous,
            sourceSystem,
          }));

          await screeningRepo.createSessionWithResults(
            {
              citizenId,
              screenedAt: normalized.screeningDate,
              venueType: normalized.venueType,
              facilityId,
              facilityName,
              isComplete: normalized.isComplete,
              sourceSystem,
              sourceRecordId: normalized.sourceRecordId,
            },
            screeningResultsData
          );

          acceptedCount++;
        } else if (mpiResult.destination === 'QUALITY_QUEUE') {
          if (mpiResult.qualityIssue) {
            await dataQualityRepo.addIssue(mpiResult.qualityIssue);
          }
          qualityQueueCount++;
        } else if (mpiResult.destination === 'AGGREGATE_ONLY') {
          // Destination B: Anonymous Aggregate Path (counted for statistics, no PII stored)
          aggregateOnlyCount++;
        }
      } catch (err) {
        console.error('Error processing record:', err);
        rejectedCount++;
      }
    }

    // 3. Finalize Run Status & Watermark
    const completedAt = new Date().toISOString();
    const finalStatus = rejectedCount > 0 ? 'PARTIAL_FAILED' : 'SUCCESS';

    await ingestionRepo.updateRun(run.id, {
      completedAt,
      receivedCount: records.length,
      acceptedCount,
      qualityQueueCount,
      aggregateOnlyCount,
      rejectedCount,
      watermarkTo: completedAt,
      status: finalStatus,
    });

    // Watermark Safety Rule: Only advance watermark if NO rejected records
    let watermarkAdvanced = false;
    if (rejectedCount === 0) {
      await ingestionRepo.advanceWatermark(facilityId, completedAt);
      watermarkAdvanced = true;
    }

    // Audit Ingestion Event
    await auditService.log(user, 'CREATE', 'INGESTION_RUN', {
      targetLabel: `Ingestion ${sourceSystem} (${records.length} records)`,
      purposeCode: 'CKG_INGESTION_SYNC',
      rowCount: records.length,
      facilityId,
      facilityName,
      details: {
        acceptedCount,
        qualityQueueCount,
        aggregateOnlyCount,
        rejectedCount,
        watermarkAdvanced,
      },
    });

    return {
      runId: run.id,
      sourceSystem,
      receivedCount: records.length,
      acceptedCount,
      qualityQueueCount,
      aggregateOnlyCount,
      rejectedCount,
      status: finalStatus,
      watermarkAdvanced,
    };
  },

  /**
   * Generates a sample mock batch of CKG screening data for demonstration
   */
  generateMockBatch(count: number = 100): any[] {
    const records = [];
    const pkmNames = ['Puskesmas Bobong', 'Puskesmas Lede', 'Puskesmas Samuya', 'Puskesmas Losseng', 'Puskesmas Nggele'];
    const names = [
      'Hasim Taliabu',
      'Salmawati Bobong',
      'Sudirman Gala',
      'Nur Aini', // Will trigger SAME_NIK_DIFFERENT_NAME or Ambiguous
      'La Ode Hamid', // Will trigger Ambiguous
      'Rustam Efendi', // Will trigger Invalid NIK
      'Mansur Ternate', // Outside work area
      'Baharuddin Sangaji',
      'Mariana Galela',
      'Zulkifli Morotai',
    ];

    for (let i = 0; i < count; i++) {
      const idx = i % names.length;
      const isDqCase = i < 10;
      const isAggregateCase = i >= 10 && i < 18;

      let nik = `820801${Math.floor(1000000000 + Math.random() * 8999999999)}`;
      let name = `${names[idx]} ${i > 10 ? `(${i})` : ''}`.trim();
      let dob = `19${60 + (i % 35)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`;

      if (isDqCase) {
        if (i === 0) {
          // SAME_NIK_DIFFERENT_NAME
          nik = '8208016903120001';
          name = 'Nur Aini';
          dob = '1969-03-12';
        } else if (i === 1) {
          // IDENTITY_AMBIGUOUS
          name = 'Hamid La Ode';
          dob = '1974-04-12';
          nik = '8208017404129999';
        } else if (i === 2) {
          // INVALID_NIK
          nik = '82080199';
        }
      }

      records.push({
        sourceRecordId: `CKG-BATCH-${new Date().toISOString().slice(0, 10)}-${String(i + 1).padStart(4, '0')}`,
        nik,
        fullName: name,
        birthDate: dob,
        sex: i % 2 === 0 ? 'MALE' : 'FEMALE',
        phone: `0812${Math.floor(10000000 + Math.random() * 89999999)}`,
        village: i % 2 === 0 ? 'Bobong' : 'Wayo',
        facility: pkmNames[i % pkmNames.length],
        screeningDate: new Date().toISOString().slice(0, 10),
        systolic: 110 + (i % 55),
        diastolic: 70 + (i % 30),
        glucose: 90 + (i % 120),
        weight: 50 + (i % 35),
        height: 150 + (i % 25),
        venue: i % 3 === 0 ? 'POSYANDU' : 'FACILITY',
      });
    }

    return records;
  },

  /**
   * Parses CSV string into raw JSON objects
   */
  parseCsv(content: string): any[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx];
      });
      records.push(obj);
    }

    return records;
  },
};
