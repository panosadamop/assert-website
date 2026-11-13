import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from './users.service';
import { AuthGuard, AuthedRequest } from './auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async login(@Body() body: { email?: string; password?: string }) {
    const user = await this.users.verify(String(body?.email || ''), String(body?.password || ''));
    if (!user) throw new UnauthorizedException('Wrong email or password.');
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { token, user: this.users.strip(user) };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return this.users.strip(this.users.findById(req.user.id)!);
  }

  @Post('password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async password(@Req() req: AuthedRequest, @Body() body: { current?: string; password?: string }) {
    const ok = await this.users.verify(req.user.email, String(body?.current || ''));
    if (!ok) throw new UnauthorizedException('Current password is wrong.');
    return this.users.setPassword(req.user.id, String(body?.password || ''));
  }
}
