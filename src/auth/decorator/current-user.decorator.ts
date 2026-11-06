import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../jwt-strategy.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);
