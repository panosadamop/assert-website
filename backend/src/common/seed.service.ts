import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from '../config';
import { JsonStore } from '../storage/json-store.service';

/** On first start, copies the default content from /seed into DATA_DIR and seed media into UPLOADS_DIR. */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger('Seed');

  constructor(private readonly store: JsonStore) {}

  async onModuleInit() {
    const dataSeed = path.join(config.seedDir, 'data');
    if (fs.existsSync(dataSeed)) {
      for (const file of fs.readdirSync(dataSeed).filter((f) => f.endsWith('.json'))) {
        const name = file.replace(/\.json$/, '');
        if (this.store.exists(name)) continue;
        const value = JSON.parse(fs.readFileSync(path.join(dataSeed, file), 'utf8'));
        const now = new Date().toISOString();
        const stamped = Array.isArray(value)
          ? value.map((v) => ({ createdAt: now, updatedAt: now, ...v }))
          : { updatedAt: now, ...value };
        await this.store.write(name, stamped);
        this.logger.log(`Seeded ${name}.json`);
      }
      await this.upgrade(dataSeed);
    }
    const mediaSeed = path.join(config.seedDir, 'uploads');
    if (fs.existsSync(mediaSeed)) {
      for (const file of fs.readdirSync(mediaSeed)) {
        const target = path.join(config.uploadsDir, file);
        if (!fs.existsSync(target)) fs.copyFileSync(path.join(mediaSeed, file), target);
      }
    }
  }

  /**
   * Upgrades content created by older versions: adds settings that did not exist yet
   * (top-level keys only – existing values are never overwritten).
   */
  private async upgrade(dataSeed: string) {
    for (const name of ['settings', 'navigation', 'strings']) {
      const file = path.join(dataSeed, `${name}.json`);
      if (!fs.existsSync(file) || !this.store.exists(name)) continue;
      const seed = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, unknown>;
      const current = this.store.read<Record<string, unknown>>(name, {});
      const next = { ...current };
      // Old fixed social fields → editable list of social buttons.
      if (name === 'settings' && current.social && !current.socialLinks) {
        const old = current.social as Record<string, string>;
        next.socialLinks = Object.entries(old).map(([network, url]) => ({ network, url: url || '', label: '' }));
        delete next.social;
      }
      const added = Object.keys(seed).filter((k) => !(k in next));
      for (const k of added) next[k] = seed[k];
      if (added.length || next.socialLinks !== current.socialLinks) {
        await this.store.write(name, next);
        this.logger.log(`Upgraded ${name}.json (added: ${added.join(', ') || 'social buttons'})`);
      }
    }
  }
}
