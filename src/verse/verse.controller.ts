import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerseService } from './verse.service';
import { GetVerseDto } from './dto/get-verse.dto';
import { Languages } from 'src/core/types';

@ApiTags('Verse')
@Controller('verse')
export class VerseController {
	constructor(private readonly verseService: VerseService) {}

	@Post()
	@ApiBody({
		type: GetVerseDto,
		examples: {
			exampleVerseRequest: {
				summary: 'Sample for Jean 3:16 (PDV2017) in French',
				value: {
					book: 'John',
					chapter: 3,
					verses: 16,
					version: 'PDV2017',
					language: Languages.FR,
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.OK,
		schema: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				id: { type: 'string' },
			},
		},
	})
	getVerse(@Body() dto: GetVerseDto) {
		return this.verseService.getVersion(dto);
	}
}
