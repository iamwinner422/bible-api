import { cleanText, getRandomIntInclusive } from './index';

describe('utils', () => {
	describe('cleanText', () => {
		it('collapses whitespace and trims', () => {
			expect(cleanText('  Au  commencement,\n\tDieu  ')).toBe('Au commencement, Dieu');
		});

		it('removes spaces before closing punctuation', () => {
			expect(cleanText('la lumière , et la vie ; amen !')).toBe('la lumière, et la vie; amen!');
		});

		it('removes spaces inside quotes and brackets', () => {
			expect(cleanText('« Viens » ( et vois )')).toBe('«Viens» (et vois)');
		});

		it('adds a missing space after punctuation followed by a letter', () => {
			expect(cleanText('Il dit:Viens.Et il vint')).toBe('Il dit: Viens. Et il vint');
		});

		it('returns an empty string for blank input', () => {
			expect(cleanText(' \n ')).toBe('');
		});
	});

	describe('getRandomIntInclusive', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('returns the minimum when Math.random returns 0', () => {
			jest.spyOn(Math, 'random').mockReturnValue(0);

			expect(getRandomIntInclusive(1, 6)).toBe(1);
		});

		it('returns the maximum when Math.random is just below 1', () => {
			jest.spyOn(Math, 'random').mockReturnValue(0.9999);

			expect(getRandomIntInclusive(1, 6)).toBe(6);
		});

		it('rounds non-integer bounds inward', () => {
			jest.spyOn(Math, 'random').mockReturnValue(0);
			expect(getRandomIntInclusive(1.2, 5.8)).toBe(2);

			jest.spyOn(Math, 'random').mockReturnValue(0.9999);
			expect(getRandomIntInclusive(1.2, 5.8)).toBe(5);
		});
	});
});
