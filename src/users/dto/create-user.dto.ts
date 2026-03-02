
import {MinLength,IsEmail ,IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({description: 'Email',  example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({description: 'Имя пользователя', example: 'John Doe'})
  @IsString()  
  @MinLength(2)
  name: string;

    @ApiProperty({description: 'Пароль', example: 'password123'}) 
  @IsString()  
  @MinLength(6)
  password: string;

}