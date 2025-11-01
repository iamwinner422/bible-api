import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { DEFAULT_VERSIONS } from '../../core/constants';
import { Languages } from '../../core/types';


export class GetRandomVerseDto {
	@ApiProperty({
		description: 'Version',
		example: 'KJV',
	})
	@IsOptional()
	version?: string = DEFAULT_VERSIONS[Languages.EN].name;

	@ApiProperty({
		description: 'Language',
		example: 'en',
		enum: Languages
	})
	@IsOptional()
	language?: string = Languages.EN;
}
