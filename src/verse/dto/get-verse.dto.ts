import { IsNotEmpty, IsOptional } from 'class-validator';
import { DEFAULT_VERSIONS } from 'src/core/constants';
import { Languages } from 'src/core/types';


export class GetVerseDto {
	@IsNotEmpty()
	readonly book: string;

	@IsNotEmpty()
	readonly chapter: string;

	@IsNotEmpty()
	readonly verses: string;

	@IsOptional()
	version: string = DEFAULT_VERSIONS[Languages.EN].name;

	@IsOptional()
	language: string = Languages.EN;
}
