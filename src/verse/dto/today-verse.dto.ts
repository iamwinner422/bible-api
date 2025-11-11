import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TodayVerseDto {
	@ApiProperty({
		description: 'Language',
		example: 'en',
	})
	@IsString()
	language: string;
}
