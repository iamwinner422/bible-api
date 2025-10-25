import { Test, TestingModule } from '@nestjs/testing';
import { VersesController } from './verses.controller';

describe('VersesController', () => {
	let controller: VersesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [VersesController],
		}).compile();

		controller = module.get<VersesController>(VersesController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
