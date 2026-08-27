import { RoleId, Status, User } from '../types';
import { rawStorage, simulateNetworkDelay } from './storage';

export const userRepo = {
  async getUsers(options?: {
    roleId?: RoleId | 'ALL';
    facilityId?: string;
    status?: Status;
    kecamatanId?: string;
    desaId?: string;
    search?: string;
  }): Promise<User[]> {
    await simulateNetworkDelay();
    let list = rawStorage.getUsers();

    if (options?.roleId && options.roleId !== 'ALL') {
      list = list.filter((u) => u.roleId === options.roleId);
    }
    if (options?.facilityId) {
      list = list.filter((u) => u.facilityId === options.facilityId);
    }
    if (options?.status) {
      list = list.filter((u) => u.status === options.status);
    }
    if (options?.kecamatanId) {
      list = list.filter((u) => u.areaScopes.includes(options.kecamatanId!));
    }
    if (options?.desaId) {
      list = list.filter((u) => u.areaScopes.includes(options.desaId!) || u.villageAssignment === options.desaId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.facilityName.toLowerCase().includes(q) ||
          u.roleName.toLowerCase().includes(q),
      );
    }
    return list;
  },

  async getUserById(id: string): Promise<User | undefined> {
    const list = rawStorage.getUsers();
    return list.find((u) => u.id === id);
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const list = rawStorage.getUsers();
    return list.find((u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await simulateNetworkDelay();
    const list = rawStorage.getUsers();

    // Check duplicate username or email
    if (list.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error(`Username "${data.username}" sudah digunakan.`);
    }

    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    rawStorage.setUsers([...list, newUser]);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await simulateNetworkDelay();
    const list = rawStorage.getUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Pengguna tidak ditemukan');

    const updated: User = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    rawStorage.setUsers([...list]);
    return updated;
  },

  async toggleStatus(id: string, status: Status): Promise<User> {
    return this.updateUser(id, { status });
  },
};
