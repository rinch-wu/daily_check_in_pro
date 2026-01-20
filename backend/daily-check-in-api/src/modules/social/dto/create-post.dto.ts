import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}