import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';

export class CreateCheckInItemDto {
  @IsString()
  name: string;

  @IsEnum(['count', 'timing', 'proof'])
  type: 'count' | 'timing' | 'proof';

  @IsOptional()
  @IsString()
  dailyTarget?: string;

  @IsEnum(['daily', 'weekly', 'custom'])
  cycle: 'daily' | 'weekly' | 'custom';

  @IsOptional()
  @IsString()
  reminderTime?: string;

  @IsOptional()
  @IsString()
  reminderText?: string;
}