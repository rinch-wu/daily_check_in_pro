import { IsString, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  avatar?: string;
}