

import {IsEnum, Min, MinLength,IsEmail ,IsString, IsDate, Max, IsInt, IsOptional } from "class-validator";
import { Status } from "src/generated/prisma/browser";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({ description: 'Название задачи', example: 'Сделать домашнее задание' })
  @IsString()
  title: string;
  
  @ApiProperty({ description: 'Описание задачи', example: 'Домашнее задание по математике' })
  @IsString()  
  @MinLength(2)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Статус задачи',enum: Status, example: Status.TODO })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ description: 'ID доски, к которой относится задача', example: 1 })
    @IsInt()
  boardId: number;
  @ApiProperty({ description: 'ID пользователя, которому назначена задача', example: 1 }) 
  @IsInt()
  userId: number;
}