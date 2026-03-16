import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtGuard } from './auth/guards/auth.guard';
import { BoardsModule } from './boards/boards.module';
import { TaskModule } from './task/task.module';


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
     useClass: JwtGuard, // protects ALL routes by default
   },
   {
     provide: APP_GUARD,
     useClass: RolesGuard, // checks @Roles() on routes
   },
 ],
})
export class AppModule {}
