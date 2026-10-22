import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { VerseService } from './verse.service';
import { GetVerseDto } from './dto/get-verse.dto';
import { GetRandomVerseDto } from './dto/get-random-verse.dto';
import { TodayVerseDto } from './dto/today-verse.dto';
import { getSecondsUntilMidnight } from '../core/utils';

const VERSE_CACHE_CONTROL = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';

const setCacheControl = (res: Response, result: unknown, cacheControl: string) => {
	res.setHeader('Cache-Control', result instanceof Error ? 'no-store' : cacheControl);
};

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
	async getVerse(@Query() query: GetVerseDto, @Res({ passthrough: true }) res: Response) {
		const result: unknown = await this.verseService.getVerse(query);
		setCacheControl(res, result, VERSE_CACHE_CONTROL);
		return result;
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
	async getRandom(@Query() query: GetRandomVerseDto, @Res({ passthrough: true }) res: Response) {
		res.setHeader('Cache-Control', 'no-store');
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
	async getTodayVerse(@Query() query: TodayVerseDto, @Res({ passthrough: true }) res: Response) {
		const result = await this.verseService.getTodayVerse(query);
		
		setCacheControl(res, result, `public, max-age=0, s-maxage=${getSecondsUntilMidnight()}`);
		return result;
	}
}
