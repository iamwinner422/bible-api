import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerseService } from './verse.service';
import { GetVerseDto } from './dto/get-verse.dto';
import { GetRandomVerseDto } from './dto/get-random-verse.dto';
import { TodayVerseDto } from './dto/today-verse.dto';

@ApiTags('Verse')
@Controller('verse')
export class VerseController {
	constructor(private readonly verseService: VerseService) {}

	@Get()
	@ApiResponse({
		status: HttpStatus.OK,
		schema: {
			type: 'object',
			properties: {
				passage: { type: 'string' },
				title: { type: 'string' } ,
				verses: { type: 'object',
					properties: {
						verseNumber: { type: 'string'},
						verseContent: { type: 'string'}
					}
				},
				citation: { type: 'string' },
			},
		},
	})
	getVerse(@Query() query: GetVerseDto) {
		return this.verseService.getVerse(query);
	}

	@Get('random')
	@ApiResponse({
		status: HttpStatus.OK,
		schema: {
			type: 'object',
			properties: {
				passage: { type: 'string' },
				citation: { type: 'string' },
			},
		},
	})
	async getRandom(@Query() query: GetRandomVerseDto) {
		return await this.verseService.getRandomVerse(query);
	}

	@Get('today')
	@ApiResponse({
		status: HttpStatus.OK,
		schema: {
			type: 'object',
			properties: {
				passage: { type: 'string' },
				citation: { type: 'string' },
			}
		},
	})
	getTodayVerse(@Query() query: TodayVerseDto) {
		return this.verseService.getTodayVerse(query);
	}


}
