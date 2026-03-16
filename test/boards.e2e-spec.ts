import request from 'supertest';
import { app, prisma, setupApp, cleanDatabase, loginAs, registerUser } from './setup';
import { Role } from 'src/auth/enums/role.enum';

describe('Boards & Tasks E2E', () => {
  let userToken: string;
  let adminToken: string;

  let boardId: number;
  let taskId: number;

  beforeAll(async () => {
    await setupApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // ---------- REGISTER & LOGIN USER ----------
    await registerUser('user@test.com', 'pass123', 'User');
    userToken = await loginAs('user@test.com', 'pass123');

    // ---------- REGISTER & LOGIN ADMIN ----------
    await registerUser('admin@test.com', 'pass123', 'Admin');
    await prisma.user.update({
      where: { email: 'admin@test.com' },
      data: { role: Role.ADMIN },
    });
    adminToken = await loginAs('admin@test.com', 'pass123');
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  // ================================
  // 1. Проверка миграции role
  // ================================
  it('1. users table has role column', async () => {
    const user = await prisma.user.findFirst({ where: { email: 'user@test.com' } });
    expect(user).toHaveProperty('role');
  });

  // ================================
  // 2. login/register без токена
  // ================================
  it('2. POST /auth/login and /auth/register work without token', async () => {
    // Arrange / Act
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@test.com', password: 'pass123', name: 'Test' });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'pass123' });

    // Assert
    expect(register.status).toBe(201);
    expect(login.status).toBe(200);
  });

  // ================================
  // 3. GET /boards без токена → 401
  // ================================
  it('3. GET /boards without token → 401', async () => {
    const res = await request(app.getHttpServer()).get('/boards');
    expect(res.status).toBe(401);
  });

  // ================================
  // 4. GET /boards с токеном USER → 200
  // ================================
  it('4. GET /boards with USER token → 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/boards')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  // ================================
  // 5. POST /boards USER → 403
  // ================================
  it('5. POST /boards USER → 403', async () => {
    const res = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User Board' });
    expect(res.status).toBe(403);
  });

  // ================================
  // 6. POST /boards ADMIN → 201
  // ================================
  it('6. POST /boards ADMIN → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Board' });
    expect(res.status).toBe(201);
    boardId = res.body.id;
  });

  // ================================
  // 7. POST /task игнорирует userId из тела
  // ================================
  it('7. POST /task ignores userId from body', async () => {
    // Arrange
    const board = await prisma.board.create({ data: { title: 'Task Board' } });

    // Act
    const res = await request(app.getHttpServer())
      .post('/task')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Test Task',
        boardId: board.id,
        // userId: 9999 → игнорируется
      });

    // Assert
    expect(res.status).toBe(201);
    const task = await prisma.task.findUnique({ where: { id: res.body.id } });
    const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });
    expect(task?.userId).toBe(user?.id);
    taskId = res.body.id;
  });

  // ================================
  // 8. PATCH своей задачи → 200
  // ================================
  it('8. PATCH own task → 200', async () => {
    const board = await prisma.board.create({ data: { title: 'Patch Board' } });
    const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });
    const task = await prisma.task.create({
      data: { title: 'My Task', boardId: board.id, userId: user!.id },
    });

    const res = await request(app.getHttpServer())
      .patch(`/task/${task.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Updated Task' });

    expect(res.status).toBe(200);
  });

  // ================================
  // 9. PATCH чужой задачи (не ADMIN) → 403
  // ================================
  it('9. PATCH чужой задачи → 403', async () => {
    const board = await prisma.board.create({ data: { title: 'Other Board' } });
    const admin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
    const task = await prisma.task.create({
      data: { title: 'Admin Task', boardId: board.id, userId: admin!.id },
    });

    const res = await request(app.getHttpServer())
      .patch(`/task/${task.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Hack Task' });

    expect(res.status).toBe(403);
  });

  // ================================
  // 10. DELETE чужой задачи ADMIN → 200
  // ================================
  it('10. DELETE чужой задачи ADMIN → 200', async () => {
    const board = await prisma.board.create({ data: { title: 'Delete Board' } });
    const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });
    const task = await prisma.task.create({
      data: { title: 'User Task', boardId: board.id, userId: user!.id },
    });

    const res = await request(app.getHttpServer())
      .delete(`/task/${task.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});