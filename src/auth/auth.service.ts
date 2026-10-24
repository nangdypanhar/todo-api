import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { Response } from 'express';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SignUpDto } from '../users/dto/sign-up.dto.js';
import { User } from '../users/entities/user.entity.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_TTL_MS,
};

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.refreshSecret = config.getOrThrow<string>('JWT_SECRET');
  }

  signUp(signUpDto: SignUpDto): Promise<Omit<User, 'passwordHash'>> {
    return this.usersService.signUp(signUpDto);
  }

  async issueTokens(user: User, res: Response): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: '7d' },
    );
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);
    return { accessToken };
  }

  async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  async refresh(refreshToken: string | undefined, res: Response): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    let payload: { sub: number; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    let user: User;
    try {
      user = await this.usersService.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.issueTokens(user, res);
  }

  logout(res: Response): void {
    const { maxAge: _maxAge, ...clearOptions } = refreshCookieOptions;
    res.clearCookie('refreshToken', clearOptions);
  }
}
