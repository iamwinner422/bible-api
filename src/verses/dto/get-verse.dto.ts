import { IsNotEmpty, MaxLength, IsEmpty, IsEnum } from 'class-validator';
import { SupportedLanguages } from 'src/core/types';

export class GetVerseDto {
	@IsNotEmpty()
	readonly book: string;

	@IsNotEmpty()
	@MaxLength(3)
	readonly chapter: string;

	@IsNotEmpty()
	readonly verses: string;

	@IsEmpty()
	readonly version: string;

	@IsEnum(SupportedLanguages)
	readonly language: string;
}
