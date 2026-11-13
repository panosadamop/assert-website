import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JsonStore } from '../storage/json-store.service';
import { config } from '../config';

export interface Message {
  id: string;
  name: string;
  email: string;
  organisation: string;
  phone: string;
  sector: string;
  product: string;
  message: string;
  read: boolean;
  ip: string;
  createdAt: string;
}

const STORE = 'messages';
const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

@Injectable()
export class MessagesService {
  private readonly logger = new Logger('Messages');

  constructor(private readonly store: JsonStore) {}

  list(): Message[] {
    return this.store.read<Message[]>(STORE, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async submit(input: Record<string, unknown>, ip: string) {
    // Honeypot field: real visitors never fill "website".
    if (input?.website) return { ok: true };
    const msg: Message = {
      id: randomUUID(),
      name: clip(input?.name, 120),
      email: clip(input?.email, 254),
      organisation: clip(input?.organisation, 160),
      phone: clip(input?.phone, 40),
      sector: clip(input?.sector, 80),
      product: clip(input?.product, 80),
      message: clip(input?.message, 5000),
      read: false,
      ip: clip(ip, 64),
      createdAt: new Date().toISOString(),
    };
    if (!msg.name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(msg.email) || msg.message.length < 5) {
      throw new BadRequestException('Please fill in your name, a valid email and a message.');
    }
    await this.store.update<Message[]>(STORE, [], (all) => [msg, ...all].slice(0, 5000));
    void this.notify(msg);
    return { ok: true };
  }

  private async notify(m: Message) {
    if (!config.contactWebhook) return;
    try {
      await fetch(config.contactWebhook, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text: `New enquiry from ${m.name} <${m.email}>${m.organisation ? ` (${m.organisation})` : ''}\n${m.sector} / ${m.product}\n\n${m.message}`,
          message: m,
        }),
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      this.logger.warn(`Contact webhook failed: ${(err as Error).message}`);
    }
  }

  async mark(id: string, read: boolean) {
    await this.store.update<Message[]>(STORE, [], (all) => {
      if (!all.some((m) => m.id === id)) throw new NotFoundException();
      return all.map((m) => (m.id === id ? { ...m, read } : m));
    });
    return { ok: true };
  }

  async remove(id: string) {
    await this.store.update<Message[]>(STORE, [], (all) => all.filter((m) => m.id !== id));
    return { ok: true };
  }
}
