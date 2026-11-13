import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as express from 'express';
import * as path from 'node:path';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const logger = new Logger('Bootstrap');

  // Behind cPanel/Plesk/Nginx/Docker proxies – needed for correct client IPs (rate limiting).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );
  app.use(express.json({ limit: '10mb' }));

  const origins = [config.frontendUrl, ...config.corsOrigins];
  app.enableCors({ origin: (origin, cb) => cb(null, !origin || origins.includes(origin.replace(/\/$/, ''))) });

  // Uploaded media (public).
  app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d', fallthrough: true, index: false, dotfiles: 'deny' }));

  // Admin panel (static single-page app) + Ubuntu font files.
  const fontDir = path.dirname(require.resolve('@fontsource/ubuntu/package.json'));
  app.use('/admin/fonts', express.static(path.join(fontDir, 'files'), { maxAge: '30d' }));
  app.use('/admin', express.static(config.adminDir, { index: 'index.html', maxAge: config.isProd ? '1h' : 0 }));
  const http = app.getHttpAdapter().getInstance() as express.Express;
  http.get('/', (_req, res) => res.redirect('/admin/'));

  await app.listen(config.port);
  logger.log(`ASSERT CMS running on port ${config.port}  →  admin: ${config.publicUrl}/admin`);
  logger.log(`Data: ${config.dataDir}`);
  logger.log(`Uploads: ${config.uploadsDir}`);
}

bootstrap();
