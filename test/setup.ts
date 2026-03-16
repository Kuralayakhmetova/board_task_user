import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import cookieParser from 'cookie-parser';
import request from 'supertest';

export let app: INestApplication;
export let prisma: PrismaService;

let isInitialized = false;

export async function setupApp(): Promise<void> {
  if (isInitialized) return;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  prisma = moduleFixture.get<PrismaService>(PrismaService);

  isInitialized = true;
}

export async function closeApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}

export async function cleanDatabase(): Promise<void> {
  if (!prisma) return;

  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.board.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  const res = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password, name });

  if (res.status !== 201) {
    throw new Error(
      `registerUser failed [${res.status}]: ${JSON.stringify(res.body)}`,
    );
  }

  return res.body;
}

export async function loginAs(
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(
      `loginAs failed [${res.status}]: ${JSON.stringify(res.body)}`,
    );
  }

  return res.body.accessToken;
}

export async function promoteToAdmin(email: string) {
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
}

export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}