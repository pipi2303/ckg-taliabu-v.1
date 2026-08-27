import {
  FieldVisit,
  FieldWorkPackage,
  KaderAssignmentPayload,
  KaderAssignmentResponse,
  KaderDeviceState,
  LocalQueueItem,
  OfflineKaderSession,
  OfflineSchedulingRequest,
  SyncConflict,
  UrgentFieldEscalation,
} from '../types';

const KADER_STORAGE_KEYS = {
  ACTIVE_PACKAGE: 'ckg_kader_active_package_v1',
  OFFLINE_SESSION: 'ckg_kader_offline_session_v1',
  LOCAL_VISITS: 'ckg_kader_local_visits_v1',
  LOCAL_SCHEDULING: 'ckg_kader_local_scheduling_v1',
  LOCAL_URGENT: 'ckg_kader_local_urgent_v1',
  LOCAL_QUEUE: 'ckg_kader_durable_queue_v1',
  LOCAL_RESPONSES: 'ckg_kader_assignment_responses_v1',
  SYNC_CONFLICTS: 'ckg_kader_sync_conflicts_v1',
  DEVICE_STATE: 'ckg_kader_device_state_v1',
  SERVER_SYNCED_VISITS: 'ckg_server_synced_field_visits_v1',
};

const DEFAULT_DEVICE_STATE: KaderDeviceState = {
  simulatedStorageMode: 'NORMAL',
  simulatedClockSkewMinutes: 0,
  lastSyncBytesUsed: 0,
  totalSyncBytesUsed: 142,
  dangerSignGuidanceStatus: 'CLINICALLY_APPROVED',
  packageValidityDays: 7,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.error('Kader storage listener error:', e);
    }
  });
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notify();
  } catch (err) {
    console.error(`Failed to write kader storage for ${key}`, err);
  }
}

export const kaderStorageRepo = {
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Active Package (Read-only downloaded citizen data)
  getActivePackage: (userId?: string): FieldWorkPackage | null => {
    const pkg = getItem<FieldWorkPackage | null>(KADER_STORAGE_KEYS.ACTIVE_PACKAGE, null);
    if (!pkg) return null;
    if (userId && pkg.assignedUserId !== userId) return null;
    return pkg;
  },

  setActivePackage: (pkg: FieldWorkPackage | null) => {
    setItem(KADER_STORAGE_KEYS.ACTIVE_PACKAGE, pkg);
  },

  purgeExpiredPackage: (reason = 'EXPIRED') => {
    const pkg = kaderStorageRepo.getActivePackage();
    if (pkg) {
      pkg.purgedAt = new Date().toISOString();
      console.log(`[PackagePurge] Read-only package ${pkg.id} purged (${reason}). Unsynced work queue is PROTECTED.`);
      setItem(KADER_STORAGE_KEYS.ACTIVE_PACKAGE, null);
    }
  },

  // Offline Session
  getOfflineSession: (): OfflineKaderSession | null => {
    return getItem<OfflineKaderSession | null>(KADER_STORAGE_KEYS.OFFLINE_SESSION, null);
  },

  setOfflineSession: (session: OfflineKaderSession | null) => {
    setItem(KADER_STORAGE_KEYS.OFFLINE_SESSION, session);
  },

  // Local Field Visits (Autosaved on device)
  getLocalFieldVisits: (userId?: string): FieldVisit[] => {
    const all = getItem<FieldVisit[]>(KADER_STORAGE_KEYS.LOCAL_VISITS, []);
    if (userId) {
      return all.filter((v) => v.userId === userId);
    }
    return all;
  },

  saveLocalFieldVisit: (visit: FieldVisit) => {
    const all = getItem<FieldVisit[]>(KADER_STORAGE_KEYS.LOCAL_VISITS, []);
    const idx = all.findIndex((v) => v.id === visit.id || v.taskId === visit.taskId);
    if (idx >= 0) {
      all[idx] = visit;
    } else {
      all.push(visit);
    }
    setItem(KADER_STORAGE_KEYS.LOCAL_VISITS, all);
  },

  // Local Scheduling Requests
  getLocalSchedulingRequests: (userId?: string): OfflineSchedulingRequest[] => {
    const all = getItem<OfflineSchedulingRequest[]>(KADER_STORAGE_KEYS.LOCAL_SCHEDULING, []);
    return all;
  },

  saveLocalSchedulingRequest: (req: OfflineSchedulingRequest) => {
    const all = getItem<OfflineSchedulingRequest[]>(KADER_STORAGE_KEYS.LOCAL_SCHEDULING, []);
    const idx = all.findIndex((r) => r.id === req.id || r.taskId === req.taskId);
    if (idx >= 0) {
      all[idx] = req;
    } else {
      all.push(req);
    }
    setItem(KADER_STORAGE_KEYS.LOCAL_SCHEDULING, all);
  },

  // Local Urgent Escalations
  getLocalUrgentEscalations: (): UrgentFieldEscalation[] => {
    return getItem<UrgentFieldEscalation[]>(KADER_STORAGE_KEYS.LOCAL_URGENT, []);
  },

  saveLocalUrgentEscalation: (esc: UrgentFieldEscalation) => {
    const all = getItem<UrgentFieldEscalation[]>(KADER_STORAGE_KEYS.LOCAL_URGENT, []);
    const idx = all.findIndex((e) => e.id === esc.id);
    if (idx >= 0) {
      all[idx] = esc;
    } else {
      all.push(esc);
    }
    setItem(KADER_STORAGE_KEYS.LOCAL_URGENT, all);
  },

  // Local Assignment Responses (Accepted / Rejected)
  getAssignmentResponses: (): KaderAssignmentResponse[] => {
    return getItem<KaderAssignmentResponse[]>(KADER_STORAGE_KEYS.LOCAL_RESPONSES, []);
  },

  saveAssignmentResponse: (res: KaderAssignmentResponse) => {
    const all = getItem<KaderAssignmentResponse[]>(KADER_STORAGE_KEYS.LOCAL_RESPONSES, []);
    const idx = all.findIndex((r) => r.id === res.id || r.taskId === res.taskId);
    if (idx >= 0) {
      all[idx] = res;
    } else {
      all.push(res);
    }
    setItem(KADER_STORAGE_KEYS.LOCAL_RESPONSES, all);
  },

  // Durable Sync Queue (SURVIVES LOGOUT, USER SWITCHING, PACKAGE EXPIRY, APP UPDATE)
  getQueueItems: (userId?: string): LocalQueueItem[] => {
    const all = getItem<LocalQueueItem[]>(KADER_STORAGE_KEYS.LOCAL_QUEUE, []);
    if (userId) {
      return all.filter((i) => i.userId === userId);
    }
    return all;
  },

  enqueueItem: (item: LocalQueueItem) => {
    const all = getItem<LocalQueueItem[]>(KADER_STORAGE_KEYS.LOCAL_QUEUE, []);
    // Idempotent upsert
    const idx = all.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.push(item);
    }
    setItem(KADER_STORAGE_KEYS.LOCAL_QUEUE, all);
  },

  updateQueueItemStatus: (id: string, status: LocalQueueItem['syncStatus'], error?: string) => {
    const all = getItem<LocalQueueItem[]>(KADER_STORAGE_KEYS.LOCAL_QUEUE, []);
    const item = all.find((i) => i.id === id);
    if (item) {
      item.syncStatus = status;
      if (error) item.lastError = error;
      if (status === 'FAILED') item.retryCount += 1;
      setItem(KADER_STORAGE_KEYS.LOCAL_QUEUE, all);
    }
  },

  removeSyncedQueueItem: (id: string) => {
    // Only if explicitly cleaned up after successful delivery
    const all = getItem<LocalQueueItem[]>(KADER_STORAGE_KEYS.LOCAL_QUEUE, []);
    setItem(
      KADER_STORAGE_KEYS.LOCAL_QUEUE,
      all.filter((i) => i.id !== id)
    );
  },

  // Sync Conflicts
  getConflicts: (): SyncConflict[] => {
    return getItem<SyncConflict[]>(KADER_STORAGE_KEYS.SYNC_CONFLICTS, []);
  },

  saveConflict: (conflict: SyncConflict) => {
    const all = getItem<SyncConflict[]>(KADER_STORAGE_KEYS.SYNC_CONFLICTS, []);
    const idx = all.findIndex((c) => c.id === conflict.id);
    if (idx >= 0) {
      all[idx] = conflict;
    } else {
      all.unshift(conflict);
    }
    setItem(KADER_STORAGE_KEYS.SYNC_CONFLICTS, all);
  },

  // Server Synced Field Visits (Permanent Evidence Repository)
  getServerSyncedVisits: (): FieldVisit[] => {
    return getItem<FieldVisit[]>(KADER_STORAGE_KEYS.SERVER_SYNCED_VISITS, []);
  },

  appendServerSyncedVisit: (visit: FieldVisit) => {
    const all = getItem<FieldVisit[]>(KADER_STORAGE_KEYS.SERVER_SYNCED_VISITS, []);
    // Idempotent key check
    const idx = all.findIndex((v) => v.id === visit.id);
    if (idx >= 0) {
      all[idx] = visit;
    } else {
      all.unshift(visit);
    }
    setItem(KADER_STORAGE_KEYS.SERVER_SYNCED_VISITS, all);
  },

  // Device State & Simulators
  getDeviceState: (): KaderDeviceState => {
    return getItem<KaderDeviceState>(KADER_STORAGE_KEYS.DEVICE_STATE, DEFAULT_DEVICE_STATE);
  },

  setDeviceState: (updates: Partial<KaderDeviceState>) => {
    const current = kaderStorageRepo.getDeviceState();
    const updated = { ...current, ...updates };
    setItem(KADER_STORAGE_KEYS.DEVICE_STATE, updated);
  },
};
