import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const clientSignature = request.headers['x-signature'] as string;

    if (!clientSignature) {
      throw new UnauthorizedException('Missing signature');
    }

    const body =
      request.body && Object.keys(request.body).length > 0
        ? JSON.stringify(request.body)
        : '';

    const secret = this.config.get<string>('SIGNING_SECRET');
    if (!secret) throw new Error('SIGNING_SECRET not set');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature.length !== clientSignature.length)
      throw new UnauthorizedException('Invalid signature');

    const valid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(clientSignature),
    );

    if (!valid) throw new UnauthorizedException('Invalid signature');

    return true;
  }
}
