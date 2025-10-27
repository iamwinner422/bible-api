import { IsNotEmpty, IsOptional } from 'class-validator';
import { defaultVersion, SupportedLanguages } from 'src/core/types';


export class GetVerseDto {
	@IsNotEmpty()
	readonly book: string;

	@IsNotEmpty()
	readonly chapter: string;

	@IsNotEmpty()
	readonly verses: string;

	@IsOptional()
	version: string = defaultVersion[SupportedLanguages.EN].name;

	@IsOptional()
	language: string = SupportedLanguages.EN;
}
