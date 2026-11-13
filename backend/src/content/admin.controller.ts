import {
  BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Req, Res, UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard, AuthedRequest, Roles } from '../auth/auth.guard';
import { UsersService, Role } from '../auth/users.service';
import { ContentService } from './content.service';
import { MessagesService } from './messages.service';
import { JsonStore } from '../storage/json-store.service';
import { config } from '../config';

@Controller('api/admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    private readonly content: ContentService,
    private readonly messages: MessagesService,
    private readonly users: UsersService,
    private readonly store: JsonStore,
  ) {}

  @Get('schema')
  schema() {
    return { types: this.content.types(), siteUrl: this.siteUrl(), languages: this.content.languages() };
  }

  private siteUrl() {
    const s = this.content.getSingleton('settings');
    return String(s.siteUrl || config.frontendUrl).replace(/\/$/, '');
  }

  @Get('dashboard')
  dashboard() {
    const count = (n: string) => this.content.list(n).length;
    const msgs = this.messages.list();
    return {
      counts: { sectors: count('sectors'), products: count('products'), pages: count('pages'), messages: msgs.length, unread: msgs.filter((m) => !m.read).length },
      recentMessages: msgs.slice(0, 5),
      siteUrl: this.siteUrl(),
      dataDir: config.dataDir,
    };
  }

  /* ---------- singletons ---------- */

  @Get('singletons/:name')
  getSingleton(@Param('name') name: string) {
    return this.content.getSingleton(name);
  }

  @Put('singletons/:name')
  saveSingleton(@Param('name') name: string, @Body() body: unknown, @Req() req: AuthedRequest) {
    if (name === 'settings' && req.user.role !== 'admin') throw new BadRequestException('Only admins can change settings.');
    return this.content.saveSingleton(name, body);
  }

  /* ---------- collections ---------- */

  @Get('collections/:name')
  list(@Param('name') name: string) {
    return this.content.list(name);
  }

  @Post('collections/:name')
  create(@Param('name') name: string, @Body() body: unknown) {
    return this.content.create(name, body);
  }

  @Post('collections/:name/reorder')
  @HttpCode(200)
  reorder(@Param('name') name: string, @Body() body: { ids?: string[] }) {
    return this.content.reorder(name, Array.isArray(body?.ids) ? body.ids.map(String) : []);
  }

  @Get('collections/:name/:id')
  get(@Param('name') name: string, @Param('id') id: string) {
    return this.content.get(name, id);
  }

  @Put('collections/:name/:id')
  update(@Param('name') name: string, @Param('id') id: string, @Body() body: unknown) {
    return this.content.update(name, id, body);
  }

  @Delete('collections/:name/:id')
  remove(@Param('name') name: string, @Param('id') id: string) {
    return this.content.remove(name, id);
  }

  /* ---------- messages ---------- */

  @Get('messages')
  listMessages() {
    return this.messages.list();
  }

  @Patch('messages/:id')
  markMessage(@Param('id') id: string, @Body() body: { read?: boolean }) {
    return this.messages.mark(id, body?.read !== false);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.messages.remove(id);
  }

  /* ---------- cache ---------- */

  @Post('revalidate')
  @HttpCode(200)
  revalidate() {
    return this.content.revalidateNow();
  }

  /* ---------- users (admins only) ---------- */

  @Get('users')
  @Roles('admin')
  listUsers() {
    return this.users.all().map((u) => this.users.strip(u));
  }

  @Post('users')
  @Roles('admin')
  createUser(@Body() body: { email: string; name?: string; role?: Role; password: string }) {
    return this.users.create(body || ({} as never));
  }

  @Put('users/:id')
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() body: { name?: string; role?: Role; password?: string }) {
    if (body?.password) await this.users.setPassword(id, body.password);
    return this.users.updateProfile(id, body || {});
  }

  @Delete('users/:id')
  @Roles('admin')
  deleteUser(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.users.remove(id, req.user.id);
  }

  /* ---------- backup / restore (admins only) ---------- */

  @Get('backup')
  @Roles('admin')
  backup(@Res() res: Response) {
    const data: Record<string, unknown> = {};
    for (const name of this.store.list()) if (name !== 'users') data[name] = this.store.read(name, null);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="assert-cms-backup-${stamp}.json"`);
    res.json({ exportedAt: new Date().toISOString(), version: 1, data });
  }

  @Post('restore')
  @HttpCode(200)
  @Roles('admin')
  async restore(@Body() body: { data?: Record<string, unknown> }) {
    const data = body?.data;
    if (!data || typeof data !== 'object') throw new BadRequestException('Not a backup file.');
    const restored: string[] = [];
    for (const [name, value] of Object.entries(data)) {
      if (name === 'users' || !/^[a-z0-9-]+$/.test(name)) continue;
      const t = this.content.types().find((x) => x.name === name);
      if (!t && name !== 'messages') continue;
      await this.store.write(name, value);
      restored.push(name);
    }
    this.content.revalidate();
    return { ok: true, restored };
  }
}
