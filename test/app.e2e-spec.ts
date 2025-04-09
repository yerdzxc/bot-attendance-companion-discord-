import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { generateHeaders } from './utils/signature';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SetTimeDto } from '@app/time-sheet/dtos/set-time.dto';
import { DiscordUserDto } from '@app/user/dtos/discord-user.dto';
import { getFormattedDate } from './utils/date';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('(GET) /api/test', async () => {
    const headers = generateHeaders();
    const res = await request(app.getHttpServer())
      .get('/api/test')
      .set(headers)
      .expect(200);
    expect(typeof res.body).toBe('boolean');
  });

  it('(POST) /api/bind - bind user', async () => {
    const payload: DiscordUserDto = {
      discordId: '01010101',
      username: 'IT-Julz',
      discriminator: '0315',
      command: 'bind',
    };
    const headers = generateHeaders(payload);
    const res = await request(app.getHttpServer())
      .post('/api/bind')
      .set(headers)
      .send(payload)
      .expect(201);

    expect(typeof res.text).toBe('string');
  });

  it('(POST) /api/set-time - time-in', async () => {
    const payload: SetTimeDto = {
      discordId: '01010101',
      username: 'IT-Julz',
      command: 'time-in',
    };
    const headers = generateHeaders(payload);
    const res = await request(app.getHttpServer())
      .post('/api/set-time')
      .set(headers)
      .send(payload)
      .expect(201);

    expect(typeof res.text).toBe('string');
  });

  it('(POST) /api/set-time - time-out', async () => {
    const payload: SetTimeDto = {
      discordId: '01010101',
      username: 'IT-Julz',
      command: 'time-out',
    };
    const headers = generateHeaders(payload);
    const res = await request(app.getHttpServer())
      .post('/api/set-time')
      .set(headers)
      .send(payload)
      .expect(201);

    expect(typeof res.text).toBe('string');
  });

  it('(GET) /api/attendance', async () => {
    const headers = generateHeaders();
    return await request(app.getHttpServer())
      .get('/api/attendance')
      .set(headers)
      .expect(200);
  });

  it('(GET) /api/attendance - should return attendance by date', async () => {
    const headers = generateHeaders();
    const mockSignature = getFormattedDate();
    return await request(app.getHttpServer())
      .get(`/api/attendance-by-date?signature=${mockSignature}`)
      .set(headers)
      .expect(200);
  });

  it('(GET) /api/attendance-intern - should return attendance for intern', async () => {
    const headers = generateHeaders();
    return await request(app.getHttpServer())
      .get('/api/attendance-intern')
      .set(headers)
      .expect(200);
  });

  it('(GET) /api/absent - should return absent for employee', async () => {
    const headers = generateHeaders();
    return await request(app.getHttpServer())
      .get('/api/absent')
      .set(headers)
      .expect(200);
  });

  it('(GET) /api/absent-by-date - should return absent by date', async () => {
    const headers = generateHeaders();
    const mockSignature = getFormattedDate();
    return await request(app.getHttpServer())
      .get(`/api/absent-by-date?signature=${mockSignature}`)
      .set(headers)
      .expect(200);
  });

  it('(GET) /api/absent-intern - should return absent for intern', async () => {
    const headers = generateHeaders();
    return await request(app.getHttpServer())
      .get('/api/absent-intern')
      .set(headers)
      .expect(200);
  });
});
