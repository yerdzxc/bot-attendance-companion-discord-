import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export function ApiSigningSecretDecorator() {
  return applyDecorators(
    ApiHeader({
      name: 'x-signature',
      description: 'HMAC SHA256 of the request body using shared secret',
      required: true,
    }),
  );
}
