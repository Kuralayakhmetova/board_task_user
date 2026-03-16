import { IsEnum, MinLength, IsString, IsOptional, IsInt } from "class-validator";
import { Status } from 'src/auth/enums/status.enum';
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({ description: 'Название задачи', example: 'Сделать домашнее задание' })
  @IsString()
  title: string;
  
  @ApiProperty({ description: 'Описание задачи', example: 'Домашнее задание по математике', required: false })
  @IsString()  
  @MinLength(2)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Статус задачи', enum: Status, example: Status.TODO, required: false })
  @IsEnum(Status)
  @IsOptional()  // ✅ теперь поле опциональное
  status?: Status;

  @ApiProperty({ description: 'ID доски, к которой относится задача', example: 1 })
  @IsInt()
  boardId: number;
}