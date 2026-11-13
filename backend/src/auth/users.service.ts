import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { randomUUID, randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { JsonStore } from '../storage/json-store.service';
import { config } from '../config';

export type Role = 'admin' | 'editor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

const STORE = 'users';
const DUMMY_HASH = '$2b$12$/v8BgbEyW0TuG5FPI0PvwevBP.eaj65AqlIlkJUEz58vTUGzrZCT6';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger('Users');

  constructor(private readonly store: JsonStore) {}

  async onModuleInit() {
    if (this.all().length) return;
    let password = config.adminPassword;
    if (!password) {
      password = randomBytes(9).toString('base64url');
      this.logger.warn(`No ADMIN_PASSWORD set – generated one for ${config.adminEmail}: ${password}`);
    }
    await this.create({ email: config.adminEmail, name: 'Administrator', role: 'admin', password });
    this.logger.log(`Created first admin account ${config.adminEmail}`);
  }

  all(): User[] {
    return this.store.read<User[]>(STORE, []);
  }

  strip(u: User): PublicUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = u;
    return rest;
  }

  findByEmail(email: string) {
    return this.all().find((u) => u.email === email.trim().toLowerCase());
  }

  findById(id: string) {
    return this.all().find((u) => u.id === id);
  }

  private checkPassword(pw: string) {
    if (!pw || pw.length < 10) throw new BadRequestException('Password must be at least 10 characters.');
  }

  async create(input: { email: string; name?: string; role?: Role; password: string }): Promise<PublicUser> {
    const email = String(input.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestException('Invalid email address.');
    this.checkPassword(input.password);
    const user: User = {
      id: randomUUID(),
      email,
      name: String(input.name || email).slice(0, 120),
      role: input.role === 'editor' ? 'editor' : 'admin',
      passwordHash: await bcrypt.hash(input.password, 12),
      createdAt: new Date().toISOString(),
    };
    await this.store.update<User[]>(STORE, [], (all) => {
      if (all.some((u) => u.email === email)) throw new BadRequestException('A user with this email already exists.');
      return [...all, user];
    });
    return this.strip(user);
  }

  async verify(email: string, password: string): Promise<User | null> {
    const user = this.findByEmail(email || '');
    // Always run bcrypt to keep timing similar for unknown users.
    const ok = await bcrypt.compare(password || '', user?.passwordHash || DUMMY_HASH);
    if (!user || !ok) return null;
    await this.store.update<User[]>(STORE, [], (all) =>
      all.map((u) => (u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u)),
    );
    return user;
  }

  async setPassword(id: string, password: string) {
    this.checkPassword(password);
    const hash = await bcrypt.hash(password, 12);
    await this.store.update<User[]>(STORE, [], (all) => {
      if (!all.some((u) => u.id === id)) throw new NotFoundException('User not found');
      return all.map((u) => (u.id === id ? { ...u, passwordHash: hash } : u));
    });
    return { ok: true };
  }

  async updateProfile(id: string, input: { name?: string; role?: Role }) {
    await this.store.update<User[]>(STORE, [], (all) => {
      const target = all.find((u) => u.id === id);
      if (!target) throw new NotFoundException('User not found');
      const role = input.role === 'editor' || input.role === 'admin' ? input.role : target.role;
      if (target.role === 'admin' && role !== 'admin' && all.filter((u) => u.role === 'admin').length === 1) {
        throw new BadRequestException('There must be at least one admin.');
      }
      return all.map((u) => (u.id === id ? { ...u, name: String(input.name ?? u.name).slice(0, 120), role } : u));
    });
    return this.strip(this.findById(id)!);
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) throw new BadRequestException('You cannot delete your own account.');
    await this.store.update<User[]>(STORE, [], (all) => {
      const target = all.find((u) => u.id === id);
      if (!target) throw new NotFoundException('User not found');
      if (target.role === 'admin' && all.filter((u) => u.role === 'admin').length === 1) {
        throw new BadRequestException('There must be at least one admin.');
      }
      return all.filter((u) => u.id !== id);
    });
    return { ok: true };
  }
}
