import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guards/auth.guard'; // оставляем только JwtGuard

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    BoardsModule,
    TaskModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard, // защищает все маршруты по умолчанию
    },
    // RolesGuard можно удалить, если используешь декоратор @Roles() с глобальным JwtGuard
  ],
})
export class AppModule {}