import {
  BadRequestException, Controller, Delete, Get, NotFoundException, Param, Post, UploadedFiles, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomBytes } from 'node:crypto';
import { AuthGuard } from '../auth/auth.guard';
import { config } from '../config';

const ALLOWED = /^(image\/(png|jpe?g|gif|webp|svg\+xml|avif|x-icon|vnd\.microsoft\.icon)|application\/pdf|video\/mp4)$/;
const MAX_SIZE = 15 * 1024 * 1024;

function safeName(original: string) {
  const ext = path.extname(original).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 8);
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
  let name = `${base}${ext}`;
  if (fs.existsSync(path.join(config.uploadsDir, name))) name = `${base}-${randomBytes(3).toString('hex')}${ext}`;
  return name;
}

function resolveInUploads(file: string) {
  const full = path.resolve(config.uploadsDir, file);
  if (!full.startsWith(path.resolve(config.uploadsDir) + path.sep)) throw new BadRequestException('Invalid file name');
  return full;
}

@Controller('api/admin/media')
@UseGuards(AuthGuard)
export class MediaController {
  @Get()
  list() {
    return fs
      .readdirSync(config.uploadsDir, { withFileTypes: true })
      .filter((d) => d.isFile() && !d.name.startsWith('.'))
      .map((d) => {
        const stat = fs.statSync(path.join(config.uploadsDir, d.name));
        return {
          name: d.name,
          url: `/uploads/${encodeURIComponent(d.name)}`,
          absoluteUrl: `${config.publicUrl}/uploads/${encodeURIComponent(d.name)}`,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, config.uploadsDir),
        filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) =>
        ALLOWED.test(file.mimetype) ? cb(null, true) : cb(new BadRequestException(`File type ${file.mimetype} is not allowed`), false),
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files received');
    return files.map((f) => ({ name: f.filename, url: `/uploads/${encodeURIComponent(f.filename)}`, size: f.size }));
  }

  @Delete(':file')
  remove(@Param('file') file: string) {
    const full = resolveInUploads(file);
    if (!fs.existsSync(full)) throw new NotFoundException();
    fs.unlinkSync(full);
    return { ok: true };
  }
}
