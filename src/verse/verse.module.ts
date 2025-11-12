import { Module } from '@nestjs/common';
import { VerseController } from './verse.controller';
import { VerseService } from './verse.service';
import { CacheService } from '../core/services/cache.service';

@Module({
	controllers: [VerseController],
	providers: [VerseService, CacheService],
	exports: [CacheService],
})
export class VerseModule {}
