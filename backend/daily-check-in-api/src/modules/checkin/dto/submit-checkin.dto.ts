import { IsString, IsOptional } from 'class-validator';

export class SubmitCheckInDto {
  @IsOptional()
  @IsString()
  note?: string;
}