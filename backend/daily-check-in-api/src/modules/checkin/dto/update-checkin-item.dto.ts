import { PartialType } from '@nestjs/mapped-types';
import { CreateCheckInItemDto } from './create-checkin-item.dto';

export class UpdateCheckInItemDto extends PartialType(CreateCheckInItemDto) {
  @IsOptional()
  isHidden?: boolean;
}