import request from 'supertest';
import { app, prisma, setupApp, cleanDatabase, registerUser } from './setup';
import { Status } from 'src/generated/prisma/enums';

describe('Boards & Tasks E2E', () => {
  let userToken: string;
  let anotherUserToken: string; // второй обычный пользователь
  let adminToken: string;

  let createdBoardId: string;
  let createdTaskId: string;

  beforeAll(async () => {
    await setupApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // ---------- register first USER ----------
    await registerUser('user@test.com', 'pass123', 'User');
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'pass123' });
    userToken = userLogin.body.accessToken;

    // ---------- register second USER (non-owner) ----------
    await registerUser('user2@test.com', 'pass123', 'User');
    const user2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user2@test.com', password: 'pass123' });
    anotherUserToken = user2Login.body.accessToken;

    // ---------- register ADMIN ----------
    await registerUser('admin@test.com', 'pass123', 'Admin');
    await prisma.user.update({
      where: { email: 'admin@test.com' },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'pass123' });
    adminToken = adminLogin.body.accessToken;

    // ---------- create board ----------
    const boardRes = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Board' });
    createdBoardId = boardRes.body.id;

    // ---------- create initial task for first USER ----------
    const taskRes = await request(app.getHttpServer())
      .post('/task')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        title: 'Initial Task', 
        boardId: createdBoardId,
        status: 'TODO', // ✅ обязательное поле
      });
    createdTaskId = taskRes.body.id;
  });

  
afterAll(async () => {
  // Удаляем все задачи сначала — чтобы не было проблем с внешними ключами
  await prisma.task.deleteMany({});

  // Удаляем все доски
  await prisma.board.deleteMany({});

  // Удаляем тестовых пользователей
  await prisma.user.deleteMany({
    where: {
      email: { in: ['user@test.com', 'user2@test.com', 'admin@test.com', 'test@test.com'] },
    },
  });

  // Закрываем приложение
  await app.close();
});


  // =======================
  // BOARDS
  // =======================
  describe('POST /boards', () => {
    it('USER cannot create board', async () => {
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Board' });
      expect(res.status).toBe(403);
    });

    it('ADMIN can create board', async () => {
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Another Board' });
      expect(res.status).toBe(201);
    });
  });

  // =======================
  // TASKS
  // =======================
  describe('PATCH /task/:id', () => {
    it('owner can update task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/task/${createdTaskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Task' });
      expect(res.status).toBe(200);
    });

    it('non-owner user cannot update чужую задачу', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/task/${createdTaskId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`) // обычный non-owner
        .send({ title: 'Hack Task' });
      expect(res.status).toBe(403);
    });

    it('ADMIN can update чужую задачу', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/task/${createdTaskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Update Task' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /task/:id', () => {
    it('ADMIN can delete чужую задачу', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/task/${createdTaskId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('USER cannot delete чужую задачу', async () => {
      // создаем новую задачу для проверки
      const taskRes = await request(app.getHttpServer())
        .post('/task')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          title: 'Admin Task', 
          boardId: createdBoardId,
          status: 'TODO',
        });
      const taskId = taskRes.body.id;

      const res = await request(app.getHttpServer())
        .delete(`/task/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });

describe('GET /users/me', () => {
  it('without token → 401', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('with USER token → 200, has id, tasks, no password', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'user@test.com' } });

    // Удаляем старые задачи, чтобы контролировать количество
    await prisma.task.deleteMany({ where: { userId: user!.id } });

    // создаём ровно 2 задачи для проверки
    const board = await prisma.board.create({ data: { title: 'Board ME' } });
    await prisma.task.createMany({
      data: [
        { title: 'Task 1', boardId: board.id, userId: user!.id, status: Status.TODO },
        { title: 'Task 2', boardId: board.id, userId: user!.id, status: Status.TODO },
      ],
    });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('password');
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBe(2); // теперь точно 2
  });
});
});