import * as crypto from 'crypto';

export function generateHeaders(payload: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  const body =
    payload && Object.keys(payload).length > 0 ? JSON.stringify(payload) : '';
  const signingSecret = process.env.SIGNING_SECRET;
  if (!signingSecret) {
    throw new Error('SIGNING_SECRET environment variable is not defined');
  }

  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(`${timestamp}:${body}`)
    .digest('hex');

  return {
    'x-signature': signature,
    'x-signature-timestamp': timestamp,
  };
}
