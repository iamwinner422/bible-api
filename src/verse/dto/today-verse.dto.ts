import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TodayVerseDto {
	@ApiProperty({
		description: 'Language',
		example: 'en',
	})
	@IsString()
	@IsOptional()
	language?: string;
}
