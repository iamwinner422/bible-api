import { Test, TestingModule } from '@nestjs/testing';
import { VerseService } from './verse.service';

describe('VersesService', () => {
	let service: VerseService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [VerseService],
		}).compile();

		service = module.get<VerseService>(VerseService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
