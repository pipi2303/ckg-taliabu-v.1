import { Session, User } from '../types';
import { userRepo } from '../repositories/userRepo';
import { auditRepo } from '../repositories/auditRepo';
import { rawStorage } from '../repositories/storage';
import { INITIAL_USERS } from '../mock/initialData';
import { normalizeRoleId } from './permissionService';

const SESSION_STORAGE_KEY = 'ckg_current_session_v1';
const SESSION_DURATION_HOURS = 8;

export const authService = {
  getCurrentSession(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session: Session = JSON.parse(raw);

      // Check expiration
      if (new Date(session.expiresAt) < new Date()) {
        this.logout();
        return null;
      }

      // Check if user is still active in database
      const users = rawStorage.getUsers();
      const currentUser = users.find((u) => u.id === session.userId);
      if (!currentUser || currentUser.status !== 'ACTIVE') {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = this.getCurrentSession();
    if (!session) return null;
    const user = await userRepo.getUserById(session.userId);
    if (!user || user.status !== 'ACTIVE') {
      this.logout();
      return null;
    }
    return user;
  },

  async login(usernameOrEmail: string): Promise<{ session: Session; user: User }> {
    const user = await userRepo.getUserByUsername(usernameOrEmail);

    if (!user) {
      throw new Error('Nama pengguna atau email tidak ditemukan.');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Akun Anda telah dinonaktifkan. Hubungi Administrator Dinas Kesehatan.');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

    const session: Session = {
      userId: user.id,
      userName: user.name,
      roleId: user.roleId,
      roleName: user.roleName,
      facilityId: user.facilityId,
      facilityName: user.facilityName,
      areaScopes: user.areaScopes,
      loginAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      token: `ckg_jwt_${user.id}_${Date.now()}`,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    // Update user's last login
    await userRepo.updateUser(user.id, { lastLogin: now.toISOString() });

    // Append Audit Event
    await auditRepo.log({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.roleId,
      action: 'LOGIN',
      entityType: 'SESSION',
      entityId: session.token,
      targetLabel: `Masuk Sistem: ${user.name} (${user.roleName})`,
      facilityId: user.facilityId,
      facilityName: user.facilityName,
      details: { role: user.roleId, facility: user.facilityName },
    });

    return { session, user };
  },

  async logout(): Promise<void> {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      try {
        const session: Session = JSON.parse(raw);
        await auditRepo.log({
          actorUserId: session.userId,
          actorName: session.userName,
          actorRole: session.roleId,
          action: 'LOGOUT',
          entityType: 'SESSION',
          targetLabel: `Keluar Sistem: ${session.userName}`,
          facilityId: session.facilityId,
          facilityName: session.facilityName,
        });
      } catch {
        // ignore JSON parse error on logout
      }
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  async switchRoleForDemo(userIdOrRoleId: string): Promise<User> {
    if (!userIdOrRoleId) throw new Error('Pengguna demo tidak ditemukan');

    // 1. Try finding direct by ID in repository
    let user = await userRepo.getUserById(userIdOrRoleId);

    // 2. If not found by ID, search by normalized Role ID / Username / Name
    if (!user) {
      const normalizedRole = normalizeRoleId(userIdOrRoleId);
      const allUsers = rawStorage.getUsers();
      user = allUsers.find(
        (u) =>
          u.id.toLowerCase() === userIdOrRoleId.toLowerCase() ||
          u.roleId === normalizedRole ||
          u.username.toLowerCase() === userIdOrRoleId.toLowerCase()
      );
    }

    // 3. Fallback to INITIAL_USERS if missing from current storage cache
    if (!user) {
      const normalizedRole = normalizeRoleId(userIdOrRoleId);
      user = INITIAL_USERS.find(
        (u) =>
          u.id.toLowerCase() === userIdOrRoleId.toLowerCase() ||
          u.roleId === normalizedRole ||
          u.username.toLowerCase() === userIdOrRoleId.toLowerCase()
      );
      if (user) {
        // Re-seed into storage so user is discoverable
        const currentUsers = rawStorage.getUsers();
        if (!currentUsers.some((u) => u.id === user!.id)) {
          rawStorage.setUsers([...currentUsers, user]);
        }
      }
    }

    if (!user) throw new Error('Pengguna demo tidak ditemukan');
    if (user.status !== 'ACTIVE') throw new Error('Akun ini sedang nonaktif.');

    await this.login(user.username);
    return user;
  },
};
