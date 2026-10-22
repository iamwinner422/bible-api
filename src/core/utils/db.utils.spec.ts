import books from '../db/books.json';
import {
	getBookInfo,
	getFinalVersion,
	getRandomBook,
	getVersionInfo,
	getVersionInfoStandalone,
} from './db.utils';
import { DEFAULT_VERSIONS } from '../constants';
import { APOCRYPHE_BOOKS_ALIASES, BookInfo } from '../types';

describe('db.utils', () => {
	describe('getVersionInfo', () => {
		it('finds a version of the language, ignoring case', () => {
			expect(getVersionInfo('kjv', 'en')).toEqual({ id: 1, name: 'KJV' });
		});

		it('does not find a version from another language', () => {
			expect(getVersionInfo('LSG', 'en')).toBeUndefined();
		});

		it('returns undefined for an unknown language', () => {
			expect(getVersionInfo('KJV', 'de')).toBeUndefined();
		});
	});

	describe('getVersionInfoStandalone', () => {
		it('finds a version in any language and adds the language', () => {
			expect(getVersionInfoStandalone('lsg')).toEqual({ id: 93, name: 'LSG', language: 'fr' });
		});

		it('returns undefined for an unknown version', () => {
			expect(getVersionInfoStandalone('XYZ')).toBeUndefined();
		});
	});

	describe('getBookInfo', () => {
		it('finds a book by name, ignoring case', () => {
			expect(getBookInfo('jean', 'fr')).toEqual({ book: 'Jean', alias: 'JHN', chapters: 21 });
		});

		it('finds a book by alias', () => {
			expect(getBookInfo('jhn', 'en')).toEqual({ book: 'John', alias: 'JHN', chapters: 21 });
		});

		it('returns undefined for an unknown book', () => {
			expect(getBookInfo('Unknown', 'en')).toBeUndefined();
		});

		it('returns undefined for an unknown language', () => {
			expect(getBookInfo('John', 'de')).toBeUndefined();
		});
	});

	describe('getFinalVersion', () => {
		it('returns the default version of the language when none is provided', () => {
			expect(getFinalVersion(undefined, 'fr')).toBe(DEFAULT_VERSIONS.fr);
		});

		it('returns the provided version of the language', () => {
			expect(getFinalVersion('NIV', 'en')).toEqual({ id: 111, name: 'NIV' });
		});

		it('falls back to a version from another language', () => {
			expect(getFinalVersion('LSG', 'en')).toEqual({ id: 93, name: 'LSG', language: 'fr' });
		});

		it('returns undefined for an unknown version', () => {
			expect(getFinalVersion('XYZ', 'en')).toBeUndefined();
		});
	});

	describe('getRandomBook', () => {
		const frBooks = (books as Record<string, BookInfo[]>).fr;
		// Math.random value that makes getRandomIntInclusive(0, length - 1) return index
		const randomFor = (index: number) => (index + 0.5) / frBooks.length;
		const tobitIndex = frBooks.findIndex((book) => book.alias === 'TOB');

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('returns the randomly selected book', () => {
			jest.spyOn(Math, 'random').mockReturnValue(randomFor(0));

			expect(getRandomBook('fr', { id: 93, name: 'LSG' })).toBe(frBooks[0]);
		});

		it('skips apocryphal books for versions without them', () => {
			jest.spyOn(Math, 'random')
				.mockReturnValueOnce(randomFor(tobitIndex))
				.mockReturnValue(randomFor(0));

			const book = getRandomBook('fr', { id: 93, name: 'LSG' });

			expect(APOCRYPHE_BOOKS_ALIASES).not.toContain(book.alias);
			expect(book).toBe(frBooks[0]);
		});

		it('keeps apocryphal books for versions that include them', () => {
			jest.spyOn(Math, 'random').mockReturnValue(randomFor(tobitIndex));

			expect(getRandomBook('fr', { id: 504, name: 'BCC1923' }).alias).toBe('TOB');
		});
	});
});
