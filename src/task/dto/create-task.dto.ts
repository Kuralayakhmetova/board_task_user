

import {IsEnum, Min, MinLength,IsEmail ,IsString, IsDate, Max, IsInt, IsOptional } from "class-validator";
import { Status } from "src/generated/prisma/browser";


export class CreateTaskDto {
  @IsString()
  title: string;
  
  @IsString()  
  @MinLength(2)
  @IsOptional()
  description?: string;

  @IsEnum(Status)
  status: Status;


    @IsInt()
  boardId: number;
  @IsInt()
  userId: number;
}