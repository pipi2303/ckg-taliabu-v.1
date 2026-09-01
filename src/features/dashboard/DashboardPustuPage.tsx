import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  HeartHandshake,
  HeartPulse,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { DocBadge } from '../../components/common/DocBadge';
import { DaftarTugasPustu } from './components/DaftarTugasPustu';
import { StatistikKinerjaPustu } from './components/StatistikKinerjaPustu';
import { GrafikDistribusiKunjunganPustu } from './components/GrafikDistribusiKunjunganPustu';
import { useAuth } from '../../context/AuthContext';
import { useNetwork } from '../../context/NetworkContext';
import { rawStorage, subscribeToStorage } from '../../repositories/storage';
import { CareTask, Appointment, Citizen, RiskClassification, User as AppUser } from '../../types';
import { permissionService } from '../../services/permissionService';

interface DashboardPustuPageProps {
  onNavigate: (navId: string) => void;
  currentUser?: AppUser | null;
}

interface LocalCheckInRecord {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenNik: string;
  desaName: string;
  dusun: string;
  age: number;
  gender: 'L' | 'P';
  riskCategory: 'GREEN' | 'YELLOW' | 'RED' | 'DARK_RED';
  serviceType: string;
  checkInTime: string;
  status: 'WAITING' | 'EXAMINING' | 'COMPLETED' | 'REFERRED';
  bloodPressure?: string;
  bloodSugar?: number;
  complaint?: string;
  notes?: string;
}

interface BufferStockItem {
  id: string;
  name: string;
  category: 'OBAT' | 'ALKES' | 'REAGEN';
  currentStock: number;
  unit: string;
  minSafeBuffer: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  lastRestocked: string;
  nextPlannedSupply: string;
}

export const DashboardPustuPage: React.FC<DashboardPustuPageProps> = ({
  onNavigate,
  currentUser: propUser,
}) => {
  const { currentUser: authUser } = useAuth();
  const currentUser = propUser || authUser;
  const { isOffline } = useNetwork();

  // Pustu Village Coverage info
  const pustuName = currentUser?.facilityName || 'Pustu Desa Wayo';
  const villageName =
    currentUser?.villageAssignmentName ||
    (currentUser as any)?.desaName ||
    currentUser?.areaScopeNames?.[0] ||
    'Desa Wayo';
  const kecamatanName =
    currentUser?.areaScopeNames?.[1] ||
    (currentUser as any)?.kecamatanName ||
    'Taliabu Barat';
  const assignedDesaList = currentUser?.areaScopeNames?.length
    ? currentUser.areaScopeNames
    : ['Desa Wayo', 'Desa Ratahaya'];

  // State
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [classifications, setClassifications] = useState<RiskClassification[]>([]);
  const [kaderList, setKaderList] = useState<AppUser[]>([]);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<'CHECKINS' | 'OUTREACH' | 'GRAFIK' | 'BUFFER_STOCK' | 'KADER'>(
    'CHECKINS'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'NORMAL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Interactive Modals
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<CareTask | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedCheckInForExam, setSelectedCheckInForExam] = useState<LocalCheckInRecord | null>(null);

  // Form State for Quick Check-In
  const [newCheckInName, setNewCheckInName] = useState('');
  const [newCheckInNik, setNewCheckInNik] = useState('');
  const [newCheckInDesa, setNewCheckInDesa] = useState(villageName);
  const [newCheckInService, setNewCheckInService] = useState('Kontrol Rutin Hipertensi & GDS');
  const [newCheckInComplaint, setNewCheckInComplaint] = useState('');

  // Form State for Examination / Update TTV
  const [examSystolic, setExamSystolic] = useState('135');
  const [examDiastolic, setExamDiastolic] = useState('85');
  const [examGds, setExamGds] = useState('142');
  const [examNotes, setExamNotes] = useState('');
  const [examReferralNeeded, setExamReferralNeeded] = useState(false);

  // Form State for Task Delegation
  const [selectedKaderId, setSelectedKaderId] = useState('');
  const [delegationInstructions, setDelegationInstructions] = useState('');

  // Form State for Restock
  const [restockItemName, setRestockItemName] = useState('Amlodipine 5mg');
  const [restockQuantity, setRestockQuantity] = useState('500');
  const [restockReason, setRestockReason] = useState('Antisipasi cuaca gelombang barat laut Pulau Taliabu');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local interactive check-in records state (seeded with realistic Pustu cases)
  const [checkIns, setCheckIns] = useState<LocalCheckInRecord[]>([
    {
      id: 'chk-01',
      citizenId: 'ctz-01',
      citizenName: 'Rusli Usman',
      citizenNik: '8207011205780001',
      desaName: 'Desa Wayo',
      dusun: 'Dusun 1 Tanjung',
      age: 58,
      gender: 'L',
      riskCategory: 'DARK_RED',
      serviceType: 'Kontrol Hipertensi Tak Terkontrol & GDS',
      checkInTime: '08:15',
      status: 'WAITING',
      bloodPressure: '165/100',
      bloodSugar: 210,
      complaint: 'Pusing berputar, tengkuk terasa kaku sejak kemarin malam.',
    },
    {
      id: 'chk-02',
      citizenId: 'ctz-02',
      citizenName: 'Siti Aminah',
      citizenNik: '8207015408820002',
      desaName: 'Desa Wayo',
      dusun: 'Dusun 2 Pantai',
      age: 52,
      gender: 'P',
      riskCategory: 'RED',
      serviceType: 'Pengambilan Buffer Obat Diabetes & Tensi',
      checkInTime: '08:45',
      status: 'COMPLETED',
      bloodPressure: '130/85',
      bloodSugar: 145,
      complaint: 'Kontrol rutin bulanan, obat Metformin sisa 2 tablet.',
      notes: 'Diberikan paket obat 30 hari. Edukasi pola makan rendah garam.',
    },
    {
      id: 'chk-03',
      citizenId: 'ctz-03',
      citizenName: 'Hamid La Ode',
      citizenNik: '8207011904720003',
      desaName: 'Desa Wayo',
      dusun: 'Dusun 3 Kebun',
      age: 61,
      gender: 'L',
      riskCategory: 'RED',
      serviceType: 'Pemeriksaan Lanjutan Suspek DM Tipe 2',
      checkInTime: '09:10',
      status: 'WAITING',
      bloodPressure: '140/90',
      bloodSugar: 188,
      complaint: 'Sering haus dan buang air kecil di malam hari.',
    },
    {
      id: 'chk-04',
      citizenId: 'ctz-04',
      citizenName: 'Nurhayati Duwila',
      citizenNik: '8207016211890004',
      desaName: 'Desa Ratahaya',
      dusun: 'Dusun Ratahaya Pesisir',
      age: 46,
      gender: 'P',
      riskCategory: 'YELLOW',
      serviceType: 'Skrining Ulang CKG & Edukasi Gaya Hidup',
      checkInTime: '09:40',
      status: 'EXAMINING',
      bloodPressure: '128/82',
      bloodSugar: 118,
      complaint: 'Pemeriksaan rutin berkala CKG.',
    },
  ]);

  // Pustu Buffer Stock list (simulated tracking for coastal island pustu)
  const [bufferStock, setBufferStock] = useState<BufferStockItem[]>([
    {
      id: 'stk-01',
      name: 'Amlodipine 5mg Tab',
      category: 'OBAT',
      currentStock: 450,
      unit: 'Tablet',
      minSafeBuffer: 200,
      status: 'SAFE',
      lastRestocked: '2026-08-20',
      nextPlannedSupply: '2026-09-20',
    },
    {
      id: 'stk-02',
      name: 'Metformin 500mg Tab',
      category: 'OBAT',
      currentStock: 180,
      unit: 'Tablet',
      minSafeBuffer: 250,
      status: 'WARNING',
      lastRestocked: '2026-08-15',
      nextPlannedSupply: '2026-09-10',
    },
    {
      id: 'stk-03',
      name: 'Captopril 25mg Tab',
      category: 'OBAT',
      currentStock: 80,
      unit: 'Tablet',
      minSafeBuffer: 150,
      status: 'CRITICAL',
      lastRestocked: '2026-08-01',
      nextPlannedSupply: '2026-09-05',
    },
    {
      id: 'stk-04',
      name: 'Simvastatin 10mg Tab',
      category: 'OBAT',
      currentStock: 220,
      unit: 'Tablet',
      minSafeBuffer: 150,
      status: 'SAFE',
      lastRestocked: '2026-08-22',
      nextPlannedSupply: '2026-09-25',
    },
    {
      id: 'stk-05',
      name: 'Strip Uji Gula Darah (GDS)',
      category: 'REAGEN',
      currentStock: 35,
      unit: 'Strip',
      minSafeBuffer: 50,
      status: 'WARNING',
      lastRestocked: '2026-08-10',
      nextPlannedSupply: '2026-09-12',
    },
    {
      id: 'stk-06',
      name: 'Lancet & Alkohol Swab',
      category: 'ALKES',
      currentStock: 120,
      unit: 'Pcs',
      minSafeBuffer: 100,
      status: 'SAFE',
      lastRestocked: '2026-08-20',
      nextPlannedSupply: '2026-09-20',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load storage data
  const loadData = () => {
    const rawCitizens = rawStorage.getCitizens().filter((c) => !c.mergedIntoId);
    const rawTasks = rawStorage.getCareTasks();
    const rawAppts = rawStorage.getAppointments();
    const rawClass = rawStorage.getRiskClassifications().filter((c) => !c.supersededById);
    const rawUsers = rawStorage.getUsers();

    setCitizens(rawCitizens);
    setCareTasks(rawTasks);
    setAppointments(rawAppts);
    setClassifications(rawClass);

    // Filter kader in Pustu's village area
    const kaders = rawUsers.filter(
      (u) =>
        u.roleId === 'KADER' &&
        u.status === 'ACTIVE' &&
        (u.villageAssignmentName?.toLowerCase().includes('wayo') ||
          u.areaScopeNames?.some((a) => a.toLowerCase().includes('wayo')) ||
          true)
    );
    setKaderList(kaders);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStorage(loadData);
    return unsubscribe;
  }, []);

  // Filter Care Tasks relevant to this Pustu's village area
  const pustuVillageTasks = useMemo(() => {
    return careTasks.filter((t) => {
      // Check if task is associated with this village or assigned
      const taskVillage = t.villageName || '';
      const isVillageMatch =
        taskVillage.toLowerCase().includes('wayo') ||
        taskVillage.toLowerCase().includes('ratahaya') ||
        taskVillage.toLowerCase().includes('talo') ||
        !t.villageName; // include fallback tasks if not tagged
      return isVillageMatch;
    });
  }, [careTasks]);

  // Pending Outreach Tasks (Tasks that need home visit, contact, or follow-up by Pustu/Kader)
  const pendingOutreachTasks = useMemo(() => {
    return pustuVillageTasks.filter(
      (t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
    );
  }, [pustuVillageTasks]);

  // Citizens in Pustu's village coverage
  const villageCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const cVillage = c.desaName || '';
      return (
        cVillage.toLowerCase().includes('wayo') ||
        cVillage.toLowerCase().includes('ratahaya') ||
        cVillage.toLowerCase().includes('talo') ||
        c.kecamatanName?.toLowerCase().includes('taliabu')
      );
    });
  }, [citizens]);

  // KPI Calculations
  const totalTodayCheckIns = checkIns.length;
  const completedTodayCheckIns = checkIns.filter((c) => c.status === 'COMPLETED').length;
  const waitingTodayCheckIns = checkIns.filter(
    (c) => c.status === 'WAITING' || c.status === 'EXAMINING'
  ).length;

  const totalPendingOutreach = pendingOutreachTasks.length;
  const criticalPendingOutreach = pendingOutreachTasks.filter(
    (t) => t.isCritical || t.priorityScore >= 80
  ).length;
  const assignedToKaderCount = pendingOutreachTasks.filter((t) => t.assignedToUserId).length;

  const lowBufferStockCount = bufferStock.filter(
    (s) => s.status === 'WARNING' || s.status === 'CRITICAL'
  ).length;

  // Filtered check-ins
  const filteredCheckIns = useMemo(() => {
    return checkIns.filter((item) => {
      const matchSearch =
        item.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citizenNik.includes(searchQuery) ||
        item.dusun.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [checkIns, searchQuery, filterStatus]);

  // Filtered outreach tasks
  const filteredOutreachTasks = useMemo(() => {
    return pendingOutreachTasks.filter((task) => {
      const matchSearch =
        (task.citizenName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.citizenNik || '').includes(searchQuery) ||
        (task.villageName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchUrgency =
        filterUrgency === 'ALL' ||
        (filterUrgency === 'CRITICAL' && (task.isCritical || task.priorityScore >= 80)) ||
        (filterUrgency === 'HIGH' && task.priorityScore >= 60 && task.priorityScore < 80) ||
        (filterUrgency === 'NORMAL' && task.priorityScore < 60 && !task.isCritical);
      return matchSearch && matchUrgency;
    });
  }, [pendingOutreachTasks, searchQuery, filterUrgency]);

  // Handlers for Check-in
  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckInName.trim()) return;

    const newRecord: LocalCheckInRecord = {
      id: `chk-${Date.now().toString().slice(-4)}`,
      citizenId: `ctz-${Date.now().toString().slice(-4)}`,
      citizenName: newCheckInName,
      citizenNik: newCheckInNik || '8207010000000000',
      desaName: newCheckInDesa,
      dusun: 'Dusun Wayo Barat',
      age: 48,
      gender: 'L',
      riskCategory: 'RED',
      serviceType: newCheckInService,
      checkInTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'WAITING',
      complaint: newCheckInComplaint || 'Pemeriksaan rutin dan konsultasi keluhan di Pustu.',
    };

    setCheckIns([newRecord, ...checkIns]);
    setIsCheckInModalOpen(false);
    setNewCheckInName('');
    setNewCheckInNik('');
    setNewCheckInComplaint('');
    showToast(`Pendaftaran check-in pasien ${newRecord.citizenName} berhasil dicatat.`);
  };

  // Handlers for Examination / TTV update
  const handleSaveExamination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckInForExam) return;

    const updated = checkIns.map((item) => {
      if (item.id === selectedCheckInForExam.id) {
        return {
          ...item,
          bloodPressure: `${examSystolic}/${examDiastolic}`,
          bloodSugar: Number(examGds) || 120,
          status: examReferralNeeded ? ('REFERRED' as const) : ('COMPLETED' as const),
          notes: examNotes || (examReferralNeeded ? 'Dirujuk ke Puskesmas Bobong untuk evaluasi dokter spesialis/primer.' : 'Pemeriksaan TTV selesai. Diberikan konseling gaya hidup & obat rutin.'),
        };
      }
      return item;
    });

    setCheckIns(updated);
    setIsExamModalOpen(false);
    showToast(
      examReferralNeeded
        ? `Pasien ${selectedCheckInForExam.citizenName} telah dicatat dan dirujuk ke Puskesmas Induk.`
        : `Hasil pemeriksaan ${selectedCheckInForExam.citizenName} (TD: ${examSystolic}/${examDiastolic}, GDS: ${examGds}) berhasil disimpan.`
    );
  };

  // Handlers for Task Delegation
  const handleDelegateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForAction || !selectedKaderId) return;

    const targetKader = kaderList.find((k) => k.id === selectedKaderId);
    const updatedTasks = careTasks.map((t) => {
      if (t.id === selectedTaskForAction.id) {
        return {
          ...t,
          status: 'ASSIGNED' as const,
          assignedToUserId: targetKader?.id,
          assignedToUserName: targetKader?.name,
          notes: delegationInstructions
            ? `${t.notes || ''} | Instruksi Pustu: ${delegationInstructions}`
            : t.notes,
        };
      }
      return t;
    });

    rawStorage.setCareTasks(updatedTasks);
    setCareTasks(updatedTasks);
    setIsDelegateModalOpen(false);
    setSelectedTaskForAction(null);
    showToast(
      `Tugas penjangkauan untuk ${selectedTaskForAction.citizenName || 'Warga'} berhasil ditugaskan kepada ${targetKader?.name || 'Kader Desa'}.`
    );
  };

  // Handlers for Task Completion
  const handleCompleteTask = (task: CareTask) => {
    const updatedTasks = careTasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: 'CLOSED' as const,
          notes: `${t.notes || ''} | Selesai ditindaklanjuti oleh Petugas Pustu pada ${new Date().toLocaleDateString('id-ID')}`,
        };
      }
      return t;
    });

    rawStorage.setCareTasks(updatedTasks);
    setCareTasks(updatedTasks);
    showToast(`Tugas penjangkauan ${task.citizenName} ditandai SELESAI.`);
  };

  // Handlers for Buffer Restock Request
  const handleRequestRestock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRestockModalOpen(false);
    showToast(
      `Permintaan restock ${restockQuantity} unit ${restockItemName} telah dikirim ke Gudang Farmasi Puskesmas Bobong.`
    );
  };

  return (
    <div className="space-y-6 pb-12" data-testid="dashboard-pustu-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00201C] text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pustu Hero Header */}
      <div className="bg-gradient-to-r from-[#00201C] via-[#00332D] to-[#0D4B40] rounded-2xl p-6 text-white shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pustu Operasional Aktif
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
              {pustuName}
            </span>
            <span className="text-xs text-slate-300">
              Kecamatan {kecamatanName} • Kab. Pulau Taliabu
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Dasbor Pelayanan & Penjangkauan Pustu
            </h1>
            <DocBadge code="SCR-PKM-A01" size="sm" />
          </div>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Pusat pemantauan harian pasien kontrol di Puskesmas Pembantu, orkestrasi tugas kunjungan kader desa binaan (<strong>{assignedDesaList.join(', ')}</strong>), dan kesiapsiagaan buffer stok obat esensial pesisir.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Petugas: <strong>{currentUser?.name || 'Nursiti Bongso Rajab'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wilayah Binaan: <strong>{villageName} & Sekitarnya</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Puskesmas Induk: <strong>Puskesmas Bobong</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Catat Pasien Datang (Check-In)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prioritas-harian')}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-emerald-300" />
            <span>Daftar Prioritas Harian</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('sinkronisasi')}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-300" />
            <span>Sinkronisasi Offline</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards: Pustu-Specific Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Check-in Pasien Hari Ini */}
        <Card
          onClick={() => setActiveTab('CHECKINS')}
          className={`p-4 border transition-all cursor-pointer ${
            activeTab === 'CHECKINS'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[#F0F7F5]'
              : 'hover:border-[#00201C] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#60716D] uppercase tracking-wider">
                Pasien Check-In Hari Ini
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black">{totalTodayCheckIns}</span>
                <span className="text-xs text-[#60716D]">Warga</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold">
              ✓ {completedTodayCheckIns} Selesai
            </span>
            <span className="text-amber-700 font-bold">
              ⏳ {waitingTodayCheckIns} Menunggu
            </span>
          </div>
        </Card>

        {/* Metric 2: Tugas Penjangkauan Tertunda (Pending Outreach) */}
        <Card
          onClick={() => setActiveTab('OUTREACH')}
          className={`p-4 border transition-all cursor-pointer ${
            activeTab === 'OUTREACH'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[#F0F7F5]'
              : 'hover:border-[#00201C] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#60716D] uppercase tracking-wider">
                Penjangkauan Tertunda
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-700">{totalPendingOutreach}</span>
                <span className="text-xs text-rose-600 font-bold">Tugas Desa</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
            <span className="text-rose-700 font-bold">
              🚨 {criticalPendingOutreach} Kritis / Merah
            </span>
            <span className="text-slate-600">
              {assignedToKaderCount} Ditugaskan Kader
            </span>
          </div>
        </Card>

        {/* Metric 3: Kesiapan Buffer Stok Obat Pustu */}
        <Card
          onClick={() => setActiveTab('BUFFER_STOCK')}
          className={`p-4 border transition-all cursor-pointer ${
            activeTab === 'BUFFER_STOCK'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[#F0F7F5]'
              : 'hover:border-[#00201C] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#60716D] uppercase tracking-wider">
                Buffer Stok Obat Pustu
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl font-black ${
                    lowBufferStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {lowBufferStockCount > 0 ? `${lowBufferStockCount} Perlu Restock` : 'Stok Aman'}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
            <span className="text-[#60716D]">6 Jenis Obat & Alkes</span>
            <span className="text-emerald-700 font-semibold">Siap Cuaca Buruk</span>
          </div>
        </Card>

        {/* Metric 4: Kader Aktif Desa Binaan */}
        <Card
          onClick={() => setActiveTab('KADER')}
          className={`p-4 border transition-all cursor-pointer ${
            activeTab === 'KADER'
              ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[#F0F7F5]'
              : 'hover:border-[#00201C] bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#60716D] uppercase tracking-wider">
                Kader Posyandu Desa
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black">{kaderList.length || 3}</span>
                <span className="text-xs text-[#60716D]">Kader Binaan</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
            <span className="text-blue-700 font-bold">Desa Wayo & Ratahaya</span>
            <span className="text-emerald-700 font-semibold">Aktif Lapangan</span>
          </div>
        </Card>
      </div>

      {/* Kartu Ringkasan: Statistik Kinerja Pustu & Target SPM Bulanan */}
      <StatistikKinerjaPustu
        tasks={careTasks}
        citizens={citizens}
        villageName={villageName}
        assignedDesaList={assignedDesaList}
        onNavigate={onNavigate}
      />

      {/* Navigation Tabs Bar */}
      <div className="border-b border-[#D8E5E2] flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('CHECKINS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'CHECKINS'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-[#60716D] hover:text-black'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Kunjungan & Check-In Pasien Hari Ini ({checkIns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('OUTREACH')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'OUTREACH'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-[#60716D] hover:text-black'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Tugas Penjangkauan Desa ({pendingOutreachTasks.length})</span>
            {criticalPendingOutreach > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-bold">
                {criticalPendingOutreach}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('GRAFIK')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'GRAFIK'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-[#60716D] hover:text-black'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Distribusi Kunjungan</span>
          </button>

          <button
            onClick={() => setActiveTab('BUFFER_STOCK')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'BUFFER_STOCK'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-[#60716D] hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Buffer Stok Obat & Reagen Pustu</span>
            {lowBufferStockCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {lowBufferStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('KADER')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'KADER'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                : 'border-transparent text-[#60716D] hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kader Posyandu Binaan</span>
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex items-center gap-2 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama warga, NIK, dusun..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D8E5E2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 w-56"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DAILY PATIENT CHECK-IN & EXAMINATION AT PUSTU */}
      {activeTab === 'CHECKINS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span>Daftar Pasien Hadir & Kontrol di {pustuName}</span>
              </h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                Pencatatan pemeriksaan fisik (Tekanan Darah, GDS), penyerahan obat rutin, dan rujukan terkoordinasi ke Puskesmas Induk.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-[#F8FBFA] border border-[#D8E5E2] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="ALL">Semua Status Kehadiran</option>
                <option value="WAITING">Menunggu Diperiksa</option>
                <option value="EXAMINING">Sedang Diperiksa</option>
                <option value="COMPLETED">Pemeriksaan Selesai</option>
                <option value="REFERRED">Dirujuk ke PKM</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCheckInModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Check-In Baru</span>
              </Button>
            </div>
          </div>

          {/* Table / List of Check-Ins */}
          <div className="bg-white rounded-xl border border-[#D8E5E2] overflow-hidden shadow-2xs">
            {filteredCheckIns.length === 0 ? (
              <div className="p-8 text-center text-[#60716D] space-y-2">
                <Stethoscope className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Tidak ada catatan check-in pasien yang cocok.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('ALL');
                  }}
                  className="text-xs"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#D8E5E2]">
                {filteredCheckIns.map((item) => {
                  const isDone = item.status === 'COMPLETED';
                  const isReferred = item.status === 'REFERRED';
                  const isWaiting = item.status === 'WAITING' || item.status === 'EXAMINING';

                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-[#F8FBFA] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-black">{item.citizenName}</span>
                          <span className="text-xs font-mono text-[#60716D]">
                            NIK: {item.citizenNik}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {item.age} thn
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#60716D]" />
                            {item.desaName} ({item.dusun})
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.serviceType}
                          </span>
                          <span className="text-[#60716D] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Jam: {item.checkInTime} WIT
                          </span>

                          {/* Risk Badge */}
                          {item.riskCategory === 'DARK_RED' && (
                            <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-100 font-bold text-[10px]">
                              Risiko Sangat Tinggi (Merah Pekat)
                            </span>
                          )}
                          {item.riskCategory === 'RED' && (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                              Risiko Tinggi (Merah)
                            </span>
                          )}
                          {item.riskCategory === 'YELLOW' && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                              Risiko Sedang (Kuning)
                            </span>
                          )}
                        </div>

                        {item.complaint && (
                          <p className="text-xs text-slate-600 italic">
                            &ldquo;{item.complaint}&rdquo;
                          </p>
                        )}

                        {/* Vital signs if examined */}
                        {(item.bloodPressure || item.bloodSugar) && (
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            {item.bloodPressure && (
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                Tekanan Darah: <strong>{item.bloodPressure} mmHg</strong>
                              </span>
                            )}
                            {item.bloodSugar && (
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                Gula Darah: <strong>{item.bloodSugar} mg/dL</strong>
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-slate-600 text-xs truncate max-w-md">
                                Catatan: {item.notes}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Status & Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai Diperiksa
                          </span>
                        )}
                        {isReferred && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                            <Truck className="w-3.5 h-3.5" />
                            Rujukan ke PKM
                          </span>
                        )}
                        {isWaiting && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Giliran
                          </span>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedCheckInForExam(item);
                            if (item.bloodPressure) {
                              const [sys, dia] = item.bloodPressure.split('/');
                              setExamSystolic(sys || '135');
                              setExamDiastolic(dia || '85');
                            }
                            if (item.bloodSugar) {
                              setExamGds(String(item.bloodSugar));
                            }
                            setExamNotes(item.notes || '');
                            setExamReferralNeeded(item.status === 'REFERRED');
                            setIsExamModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Ubah Pemeriksaan' : 'Periksa & Catat TTV'}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PENDING OUTREACH TASKS FOR VILLAGE COVERAGE (Grafik Distribusi & Daftar Tugas Pustu) */}
      {activeTab === 'OUTREACH' && (
        <div className="space-y-4">
          {/* Komponen Visual Grafik Distribusi Beban Kunjungan */}
          <GrafikDistribusiKunjunganPustu
            tasks={careTasks}
            kaderList={kaderList}
            villageName={villageName}
            assignedDesaList={assignedDesaList}
          />

          {/* Komponen Daftar Tugas Antrean Kunjungan Pustu dengan Filter Lanjutan & Pengelompokan */}
          <DaftarTugasPustu
            tasks={careTasks}
            kaderList={kaderList}
            villageName={villageName}
            assignedDesaList={assignedDesaList}
            onTaskUpdated={loadData}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* TAB 2B: DEDICATED FULL-VIEW GRAFIK DISTRIBUSI KUNJUNGAN */}
      {activeTab === 'GRAFIK' && (
        <div className="space-y-4">
          <GrafikDistribusiKunjunganPustu
            tasks={careTasks}
            kaderList={kaderList}
            villageName={villageName}
            assignedDesaList={assignedDesaList}
          />
        </div>
      )}

      {/* TAB 3: BUFFER STOK OBAT & LOGISTIK PUSTU */}
      {activeTab === 'BUFFER_STOCK' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-700" />
                <span>Ketersediaan Buffer Stok Obat Esensial di {pustuName}</span>
              </h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                Pengelolaan stok obat antihipertensi, diabetes, dan reagen skrining untuk mitigasi kendala cuaca maritim dan akses laut ke desa terpencil.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRestockModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Ajukan Permintaan Restock ke PKM</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bufferStock.map((item) => {
              const isCrit = item.status === 'CRITICAL';
              const isWarn = item.status === 'WARNING';

              return (
                <Card
                  key={item.id}
                  className={`p-4 border transition-all ${
                    isCrit
                      ? 'border-rose-300 bg-rose-50/40'
                      : isWarn
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-[#D8E5E2] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-black mt-1.5">{item.name}</h4>
                    </div>

                    {isCrit && (
                      <span className="px-2 py-0.5 rounded bg-rose-700 text-white font-bold text-[10px]">
                        Stok Kritis
                      </span>
                    )}
                    {isWarn && (
                      <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">
                        Perlu Restock
                      </span>
                    )}
                    {!isCrit && !isWarn && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Aman
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-[11px] text-[#60716D]">Sisa Stok di Pustu</p>
                      <p className="text-xl font-black text-black">
                        {item.currentStock}{' '}
                        <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-[#60716D]">Batas Buffer Aman</p>
                      <p className="text-sm font-bold text-slate-700">
                        {item.minSafeBuffer} {item.unit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#D8E5E2] text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Terakhir dipasok: {item.lastRestocked}</span>
                    <span>Jadwal rute kapal: {item.nextPlannedSupply}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: KADER POSYANDU BINAAN */}
      {activeTab === 'KADER' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D8E5E2]">
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Kader Posyandu di Wilayah Binaan {villageName}</span>
              </h3>
              <p className="text-xs text-[#60716D] mt-0.5">
                Daftar kader aktif pendamping warga untuk kunjungan rumah terstruktur dan verifikasi kepatuhan obat.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('penugasan-lapangan')}
              className="flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
              <span>Buka Modul Penugasan Lapangan</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kaderList.map((kader, idx) => {
              const assignedCount = pendingOutreachTasks.filter(
                (t) => t.assignedToUserId === kader.id
              ).length;

              return (
                <Card key={kader.id || idx} className="p-4 border border-[#D8E5E2] bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                      {kader.name?.charAt(0) || 'K'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-black truncate">{kader.name}</h4>
                      <p className="text-xs text-[#60716D]">
                        Posyandu {kader.villageAssignmentName || villageName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{kader.phone}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D8E5E2] flex items-center justify-between text-xs">
                    <span className="text-slate-600">Beban Tugas Aktif:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {assignedCount} Tugas Rumah
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`https://wa.me/${kader.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-1.5 text-xs font-semibold bg-[#F0F7F5] hover:bg-[#E2ECE9] text-emerald-900 rounded-lg border border-[#D8E5E2] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3 h-3 text-emerald-700" />
                      <span>Hubungi WhatsApp</span>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Navigation Shortcuts for Pustu */}
      <div className="bg-[#F8FBFA] p-5 rounded-2xl border border-[#D8E5E2] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#60716D] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pintasan Modul Pelayanan & Laporan Pustu</span>
          </h4>
          <span className="text-[11px] text-[#60716D]">Kewenangan Petugas Pustu (PUSTU)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('prioritas-harian')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <Activity className="w-4 h-4 text-emerald-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Prioritas Harian</p>
            <p className="text-[10px] text-[#60716D]">Antrean & SLA</p>
          </button>

          <button
            onClick={() => onNavigate('care-task')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <Calendar className="w-4 h-4 text-emerald-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Jadwal Pelayanan</p>
            <p className="text-[10px] text-[#60716D]">Care Tasks</p>
          </button>

          <button
            onClick={() => onNavigate('pemantauan-aktif')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <HeartPulse className="w-4 h-4 text-rose-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Pemantauan Aktif</p>
            <p className="text-[10px] text-[#60716D]">Siklus Pasien</p>
          </button>

          <button
            onClick={() => onNavigate('kepatuhan-kendala')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <Package className="w-4 h-4 text-amber-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Kepatuhan Obat</p>
            <p className="text-[10px] text-[#60716D]">Kendala Logistik</p>
          </button>

          <button
            onClick={() => onNavigate('registry')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <Users className="w-4 h-4 text-blue-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Registry Warga</p>
            <p className="text-[10px] text-[#60716D]">Data CKG Desa</p>
          </button>

          <button
            onClick={() => onNavigate('sinkronisasi')}
            className="p-3 bg-white rounded-xl border border-[#D8E5E2] hover:border-emerald-700 transition text-left cursor-pointer shadow-2xs group"
          >
            <RefreshCw className="w-4 h-4 text-cyan-700 mb-1 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-black">Kirim Data</p>
            <p className="text-[10px] text-[#60716D]">Sinkronisasi Offline</p>
          </button>
        </div>
      </div>

      {/* MODAL 1: QUICK CHECK-IN PASIEN BARU DI PUSTU */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Pendaftaran Check-In Pasien di Pustu</h3>
                  <p className="text-[11px] text-[#60716D]">{pustuName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCheckIn} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  required
                  value={newCheckInName}
                  onChange={(e) => setNewCheckInName(e.target.value)}
                  placeholder="Contoh: Rusli Usman"
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIK (16 Digit)</label>
                  <input
                    type="text"
                    value={newCheckInNik}
                    onChange={(e) => setNewCheckInNik(e.target.value)}
                    placeholder="820701..."
                    maxLength={16}
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Desa Domisili</label>
                  <input
                    type="text"
                    value={newCheckInDesa}
                    onChange={(e) => setNewCheckInDesa(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Layanan / Keperluan Datang</label>
                <select
                  value={newCheckInService}
                  onChange={(e) => setNewCheckInService(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Kontrol Rutin Hipertensi & GDS">Kontrol Rutin Hipertensi & GDS</option>
                  <option value="Pengambilan Buffer Obat Rutin">Pengambilan Buffer Obat Rutin</option>
                  <option value="Skrining Ulang CKG">Skrining Ulang CKG</option>
                  <option value="Keluhan Akut / Pemeriksaan Awal">Keluhan Akut / Pemeriksaan Awal</option>
                  <option value="Konsultasi Rujukan Puskesmas">Konsultasi Rujukan Puskesmas</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keluhan Utama / Gejala</label>
                <textarea
                  rows={2}
                  value={newCheckInComplaint}
                  onChange={(e) => setNewCheckInComplaint(e.target.value)}
                  placeholder="Catat keluhan pasien saat datang..."
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCheckInModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  Simpan Check-In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXAMINATION / TTV ENTRY */}
      {isExamModalOpen && selectedCheckInForExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Catat Pemeriksaan & TTV Pasien</h3>
                  <p className="text-[11px] text-[#60716D]">{selectedCheckInForExam.citizenName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExamination} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TD Sistolik (mmHg) *</label>
                  <input
                    type="number"
                    required
                    value={examSystolic}
                    onChange={(e) => setExamSystolic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TD Diastolik (mmHg) *</label>
                  <input
                    type="number"
                    required
                    value={examDiastolic}
                    onChange={(e) => setExamDiastolic(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gula Darah Sewaktu / GDS (mg/dL)</label>
                <input
                  type="number"
                  value={examGds}
                  onChange={(e) => setExamGds(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tindakan / Obat Diserahkan</label>
                <textarea
                  rows={2}
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  placeholder="Contoh: Diberikan Amlodipine 5mg x 30 tablet dari buffer stock Pustu..."
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-950">
                  <input
                    type="checkbox"
                    checked={examReferralNeeded}
                    onChange={(e) => setExamReferralNeeded(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>Perlu Rujukan ke Dokter Puskesmas Bobong</span>
                </label>
                <p className="text-[10.5px] text-purple-700 mt-1 pl-6">
                  Centang jika tekanan darah/GDS melampaui batas aman dan memerlukan penyesuaian resep dokter primer.
                </p>
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExamModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  Simpan Hasil Pemeriksaan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELEGATE TASK TO KADER */}
      {isDelegateModalOpen && selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Tugaskan Penjangkauan ke Kader</h3>
                  <p className="text-[11px] text-[#60716D]">{selectedTaskForAction.citizenName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDelegateModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDelegateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Kader Posyandu *</label>
                <select
                  required
                  value={selectedKaderId}
                  onChange={(e) => setSelectedKaderId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  {kaderList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name} ({k.villageAssignmentName || villageName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instruksi Khusus untuk Kader</label>
                <textarea
                  rows={3}
                  value={delegationInstructions}
                  onChange={(e) => setDelegationInstructions(e.target.value)}
                  placeholder="Contoh: Tolong datangi rumah bapak Rusli di Dusun 1, ingatkan minum obat dan tanyakan apakah ada keluhan pusing..."
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDelegateModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-blue-700 hover:bg-blue-600 text-white"
                >
                  Kirim Tugas ke Kader
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REQUEST BUFFER RESTOCK */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D8E5E2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8E5E2] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">Permintaan Restock Buffer Obat Pustu</h3>
                  <p className="text-[11px] text-[#60716D]">Kepada Gudang Farmasi Puskesmas Bobong</p>
                </div>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestRestock} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Obat / Alkes *</label>
                <select
                  value={restockItemName}
                  onChange={(e) => setRestockItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Amlodipine 5mg Tab">Amlodipine 5mg Tab</option>
                  <option value="Amlodipine 10mg Tab">Amlodipine 10mg Tab</option>
                  <option value="Metformin 500mg Tab">Metformin 500mg Tab</option>
                  <option value="Captopril 25mg Tab">Captopril 25mg Tab</option>
                  <option value="Simvastatin 10mg Tab">Simvastatin 10mg Tab</option>
                  <option value="Strip Uji Gula Darah (GDS)">Strip Uji Gula Darah (GDS)</option>
                  <option value="Lancet & Jarum Skrining">Lancet & Jarum Skrining</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jumlah Permintaan (Tablet / Pcs) *</label>
                <input
                  type="number"
                  required
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Kebutuhan</label>
                <textarea
                  rows={2}
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D8E5E2] rounded-lg focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D8E5E2] flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRestockModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Kirim Permintaan Logistik
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
