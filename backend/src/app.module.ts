import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { config } from './config';
import { StorageModule } from './storage/storage.module';
import { SeedService } from './common/seed.service';
import { UsersService } from './auth/users.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthController } from './auth/auth.controller';
import { ContentService } from './content/content.service';
import { MessagesService } from './content/messages.service';
import { AdminController } from './content/admin.controller';
import { PublicController } from './content/public.controller';
import { MediaController } from './media/media.controller';

@Controller('api')
class HealthController {
  @Get('health')
  health() {
    return { ok: true, time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    StorageModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpires as never },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
  ],
  controllers: [HealthController, AuthController, PublicController, AdminController, MediaController],
  providers: [
    SeedService,
    UsersService,
    AuthGuard,
    ContentService,
    MessagesService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
