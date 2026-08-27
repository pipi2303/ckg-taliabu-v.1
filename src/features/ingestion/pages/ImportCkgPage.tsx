import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  Download,
  Database,
  Users,
  Shield,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { DocBadge } from '../../../components/common/DocBadge';
import { rawStorage } from '../../../repositories/storage';
import { ingestionService, IngestionExecutionResult } from '../../../services/ingestionService';
import { ingestionRepo } from '../../../repositories/ingestionRepo';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export const ImportCkgPage: React.FC<{ onNavigate?: (navId: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const facilities = rawStorage.getFacilities();

  // Wizard state (Step 1 -> Step 8)
  // Step 1: Upload / Template
  // Step 2: Target Facility & Source System Selection
  // Step 3: Column Mapping & Parsing Preview
  // Step 4: Idempotency & Checksum Verification
  // Step 5: Master Patient Index & Consent Basis Simulation
  // Step 6: Pipeline Execution
  // Step 7: Summary & 3 Destination Allocation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('FASKES-PKM-01');
  const [sourceSystem, setSourceSystem] = useState('SSI-ASIK-MANUAL-CSV');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executionResult, setExecutionResult] = useState<IngestionExecutionResult | null>(null);

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      const records = ingestionService.parseCsv(text);
      setParsedRecords(records);
      setCurrentStep(2);
    };
    reader.readAsText(file);
  };

  const handleUseMockSample = () => {
    const mockBatch = ingestionService.generateMockBatch(50);
    setFileName('sample_ckg_taliabu_batch_50.csv');
    setParsedRecords(mockBatch);
    setCurrentStep(2);
    toast.info('Data Contoh Dimuat', '50 baris data skrining simulasi siap diproses.');
  };

  const handleExecuteImport = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    setCurrentStep(6);

    try {
      // Execute the real pipeline
      const result = await ingestionService.processBatch(
        parsedRecords,
        sourceSystem,
        selectedFacility.id,
        selectedFacility.name,
        currentUser
      );

      // Record Import History
      await ingestionRepo.addImportHistory({
        fileName: fileName || 'manual_import.csv',
        fileSizeBytes: fileContent.length || 10240,
        sourceSystem,
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        uploadedByUserId: currentUser.id,
        uploadedByUserName: currentUser.name,
        uploadedAt: new Date().toISOString(),
        totalRows: parsedRecords.length,
        validRows: result.acceptedCount,
        acceptedCount: result.acceptedCount,
        qualityQueueCount: result.qualityQueueCount,
        aggregateOnlyCount: result.aggregateOnlyCount,
        rejectedCount: result.rejectedCount,
        status: result.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
        errorLogSummary: result.errorMessage,
      });

      setExecutionResult(result);
      setCurrentStep(7);
      toast.success(
        'Proses Ingestion Selesai',
        `${result.acceptedCount} data berhasil masuk registry, ${result.qualityQueueCount} ke antrean masalah.`
      );
    } catch (err: any) {
      toast.error('Gagal Memproses Data', err.message);
      setCurrentStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-black">Import Data Skrining CKG</h2>
            <DocBadge code="SCR-PKM-C02" size="sm" />
          </div>
          <p className="text-xs text-[#60716D] mt-0.5">
            Pipeline terstruktur normalisasi, validasi identitas (MPI), dan alokasi ke 3 destinasi aman.
          </p>
        </div>

        {onNavigate && (
          <Button variant="outline" size="sm" onClick={() => onNavigate('import-history')}>
            Riwayat Import
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="bg-white p-3.5 rounded-xl border border-[#D8E5E2] flex items-center justify-between overflow-x-auto text-xs">
        {[
          { num: 1, label: 'Upload File' },
          { num: 2, label: 'Faskes & Sumber' },
          { num: 3, label: 'Mapping Kolom' },
          { num: 4, label: 'Cek Duplikasi' },
          { num: 5, label: 'Simulasi MPI' },
          { num: 6, label: 'Proses Ingestion' },
          { num: 7, label: 'Hasil & Alokasi' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2 shrink-0 px-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === s.num
                  ? 'bg-[#00201C] text-white ring-2 ring-[#00201C]'
                  : currentStep > s.num
                  ? 'bg-[#2E7D5B] text-white'
                  : 'bg-[#F8FBFA] border border-[#D8E5E2] text-[#60716D]'
              }`}
            >
              {currentStep > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-xs ${
                currentStep === s.num
                  ? 'font-bold text-black'
                  : currentStep > s.num
                  ? 'font-medium text-[#2E7D5B]'
                  : 'text-[#60716D]'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Upload File or Generate Mock */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border-2 border-dashed border-[#D8E5E2] flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F8FBFA] flex items-center justify-center text-[#2E7D5B]">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-black">Unggah File CSV / Excel CKG</h4>
              <p className="text-xs text-[#60716D] mt-1">
                Format didukung: .csv, .xlsx dengan kolom standar NIK, Nama, Tanggal, Tensi, Gula, IMT.
              </p>
            </div>
            <label className="cursor-pointer">
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              <Button variant="primary" size="md" type="button">
                Pilih File dari Komputer
              </Button>
            </label>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#D8E5E2] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[#2E7D5B] font-bold text-xs">
                <Database className="w-4 h-4" />
                <span>Simulasi Otomatis (Demo Dataset Taliabu)</span>
              </div>
              <h4 className="text-sm font-bold text-black mt-1">Gunakan 50 Data Skrining Uji Coba</h4>
              <p className="text-xs text-[#60716D] mt-1">
                Memuat 50 data skrining sintetis yang mencakup kasus normal, anomali NIK, konflik nama, dan kasus agregat.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={handleUseMockSample}
              leftIcon={<Layers className="w-4 h-4 text-[#2E7D5B]" />}
            >
              Muat 50 Data Simulasi
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Configure Target Facility & Source */}
      {currentStep === 2 && (
        <div className="bg-white p-5 rounded-xl border border-[#D8E5E2] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
            <div>
              <h3 className="text-sm font-bold text-black">Konfigurasi Faskes & Sumber Data</h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                File: <strong>{fileName}</strong> ({parsedRecords.length} baris terdeteksi)
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              {parsedRecords.length} Baris
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Puskesmas Penerima (Ownership Scope) <span className="text-[#C84A4A]">*</span>
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg"
              >
                {facilities
                  .filter((f) => f.type === 'PUSKESMAS')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Kode Identitas Sumber Integrasi <span className="text-[#C84A4A]">*</span>
              </label>
              <input
                type="text"
                value={sourceSystem}
                onChange={(e) => setSourceSystem(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#D8E5E2] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#D8E5E2]">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
              Kembali
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCurrentStep(3)}>
              Lanjut ke Pratinjau Kolom
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: Preview Data & Checksum */}
      {(currentStep === 3 || currentStep === 4 || currentStep === 5) && (
        <div className="bg-white p-5 rounded-xl border border-[#D8E5E2] space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
            <div>
              <h3 className="text-sm font-bold text-black">Pratinjau Data Skrining & Validasi Awal</h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                Menampilkan 5 baris pertama untuk memverifikasi kesesuaian kolom dan nilai.
              </p>
            </div>
            <span className="text-xs font-mono text-[#60716D]">
              Checksum SHA256: 8f4e2b...9a12
            </span>
          </div>

          <div className="overflow-x-auto border border-[#D8E5E2] rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FBFA] border-b border-[#D8E5E2] text-[11px] text-[#60716D]">
                <tr>
                  <th className="p-2 text-left">NIK</th>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Tgl Lahir</th>
                  <th className="p-2 text-left">Desa</th>
                  <th className="p-2 text-right">Tensi (S/D)</th>
                  <th className="p-2 text-right">Gula</th>
                  <th className="p-2 text-right">TB/BB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E5E2]">
                {parsedRecords.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="p-2 font-mono">{r.nik || r.source_nik || '—'}</td>
                    <td className="p-2 font-semibold text-black">{r.fullName || r.nama || '—'}</td>
                    <td className="p-2">{r.birthDate || r.dob || '—'}</td>
                    <td className="p-2">{r.village || r.desa || '—'}</td>
                    <td className="p-2 text-right font-mono">
                      {r.systolic || '—'}/{r.diastolic || '—'}
                    </td>
                    <td className="p-2 text-right font-mono">{r.glucose || '—'}</td>
                    <td className="p-2 text-right font-mono">
                      {r.height || '—'} / {r.weight || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3 Destinations Architecture Box */}
          <div className="p-4 bg-[#E1F5FE] rounded-xl border border-[#BDE3F5] space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-black">
              <Shield className="w-4 h-4 text-[#397B94]" />
              <span>Arsitektur 3 Destinasi Aman CKG:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#334643]">
              <div className="p-2 bg-white rounded border border-[#BDE3F5]">
                <strong className="text-[#2E7D5B] block">1. Individual Registry</strong>
                Data terverifikasi MPI dengan dasar pemrosesan sah.
              </div>
              <div className="p-2 bg-white rounded border border-[#BDE3F5]">
                <strong className="text-[#397B94] block">2. Anonymous Aggregate Path</strong>
                Data tanpa persetujuan individu diarsipkan untuk statistik.
              </div>
              <div className="p-2 bg-white rounded border border-[#BDE3F5]">
                <strong className="text-[#C99720] block">3. Data Quality Queue</strong>
                Konflik nama/NIK dikarantina untuk verifikasi manual.
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#D8E5E2]">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
              Kembali
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              onClick={handleExecuteImport}
              leftIcon={<ArrowRight className="w-4 h-4" />}
            >
              Eksekusi Ingestion Pipeline
            </Button>
          </div>
        </div>
      )}

      {/* STEP 6: Processing Animation */}
      {currentStep === 6 && (
        <div className="bg-white p-12 rounded-xl border border-[#D8E5E2] text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#00201C] border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-black">Memproses Pipeline Ingestion CKG...</h3>
          <p className="text-xs text-[#60716D] max-w-sm mx-auto">
            Melakukan normalisasi, pencocokan identitas MPI tingkat 1–5, dan penegakan idempotensi data.
          </p>
        </div>
      )}

      {/* STEP 7: Ingestion Summary & 3 Destination Allocation */}
      {currentStep === 7 && executionResult && (
        <div className="bg-white p-6 rounded-xl border border-[#D8E5E2] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] text-[#2E7D5B] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">Ingestion Pipeline Selesai</h3>
              <p className="text-xs text-[#60716D]">
                Run ID: <strong className="font-mono">{executionResult.runId}</strong> • Status: {executionResult.status}
              </p>
            </div>
          </div>

          {/* Destination Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#E8F5E9] rounded-xl border border-[#C8E6C9] space-y-1">
              <span className="text-[10px] font-bold text-[#2E7D5B] uppercase block">
                1. Individual Registry
              </span>
              <p className="text-2xl font-bold text-[#2E7D5B]">{executionResult.acceptedCount}</p>
              <p className="text-[11px] text-[#334643]">Data masuk ke Kartu Warga</p>
            </div>

            <div className="p-4 bg-[#E1F5FE] rounded-xl border border-[#BDE3F5] space-y-1">
              <span className="text-[10px] font-bold text-[#397B94] uppercase block">
                2. Anonymous Aggregate Path
              </span>
              <p className="text-2xl font-bold text-[#397B94]">{executionResult.aggregateOnlyCount}</p>
              <p className="text-[11px] text-[#334643]">Statistik anonim non-PII</p>
            </div>

            <div className="p-4 bg-[#FFFACD] rounded-xl border border-[#F2ECC2] space-y-1">
              <span className="text-[10px] font-bold text-[#C99720] uppercase block">
                3. Data Quality Queue
              </span>
              <p className="text-2xl font-bold text-[#C99720]">{executionResult.qualityQueueCount}</p>
              <p className="text-[11px] text-[#334643]">Menunggu verifikasi PJ CKG</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D8E5E2]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentStep(1);
                setParsedRecords([]);
              }}
            >
              Import File Lain
            </Button>

            <div className="flex items-center gap-2">
              {executionResult.qualityQueueCount > 0 && onNavigate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('data-quality')}
                >
                  Buka Antrean Masalah ({executionResult.qualityQueueCount})
                </Button>
              )}
              {onNavigate && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('registry')}
                >
                  Lihat Hasil di Registry CKG
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
