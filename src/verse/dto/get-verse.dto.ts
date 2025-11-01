import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { DEFAULT_VERSIONS } from '../../core/constants';
import { Languages } from '../../core/types';


export class GetVerseDto {
	@ApiProperty({
    	description: 'Book Name',
    	example: 'John',
  	})
	@IsNotEmpty()
	readonly book: string;

	@ApiProperty({
    	description: 'Chapter',
    	example: '3',
  	})
	@IsNotEmpty()
	readonly chapter: string;

	@ApiProperty({
    	description: 'Verses',
    	example: '16',
  	})
	@IsNotEmpty()
	readonly verses: string;

	@ApiProperty({
    	description: 'Version',
    	example: 'KJV',
  	})
	@IsOptional()
	version: string = DEFAULT_VERSIONS[Languages.EN].name;

	@ApiProperty({
    	description: 'Chapter',
    	example: 'en',
		enum: Languages
  	})
	@IsOptional()
	language: string = Languages.EN;
}
