import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';

// e2e tests: the real app against the mytasks_test database (see test/setup-env.ts).
describe('Todos (e2e)', () => {
  let app: INestApplication;
  const user = { name: 'E2E User', email: 'e2e@example.com', password: 'secret1234' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Same setup as main.ts.
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    await app.init();

    // Start every run from empty tables.
    await app
      .get(DataSource)
      .query('TRUNCATE "todo", "user" RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  it('public route: POST /api/auth/signup creates a user without a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send(user)
      .expect(201);

    expect(res.body).toMatchObject({ name: user.name, email: user.email });
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('protected route: GET /api/todo without a token is rejected with 401', async () => {
    await request(app.getHttpServer()).get('/api/todo').expect(401);
  });

  it('protected route: with a token, POST then GET /api/todo works', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(200);
    const auth = `Bearer ${login.body.accessToken}`;

    const created = await request(app.getHttpServer())
      .post('/api/todo')
      .set('Authorization', auth)
      .send({ title: 'Buy milk', status: 'open', starred: false })
      .expect(201);
    expect(created.body).toMatchObject({ id: expect.any(Number), title: 'Buy milk' });

    const list = await request(app.getHttpServer())
      .get('/api/todo')
      .set('Authorization', auth)
      .expect(200);
    expect(list.body).toEqual([expect.objectContaining({ title: 'Buy milk' })]);
  });
});
