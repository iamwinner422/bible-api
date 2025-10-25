import { Test, TestingModule } from '@nestjs/testing';
import { VersesService } from './verses.service';

describe('VersesService', () => {
	let service: VersesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [VersesService],
		}).compile();

		service = module.get<VersesService>(VersesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
