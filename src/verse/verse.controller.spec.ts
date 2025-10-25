import { Test, TestingModule } from '@nestjs/testing';
import { VerseController } from './verse.controller';

describe('VersesController', () => {
	let controller: VerseController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [VerseController],
		}).compile();

		controller = module.get<VerseController>(VerseController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
