import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // Декоратор для публичного маршрута
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
