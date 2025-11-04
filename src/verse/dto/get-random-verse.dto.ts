import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Languages } from '../../core/types';


export class GetRandomVerseDto {
	@ApiProperty({
		description: 'Version',
		example: 'KJV',
	})
	@IsOptional()
	version?: string;

	@ApiProperty({
		description: 'Language',
		example: 'en',
		enum: Languages
	})
	@IsOptional()
	language?: string;
}
