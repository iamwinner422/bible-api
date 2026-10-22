import axios from 'axios';
import { fetchTodayVerse, fetchVerses, getFinalLanguage } from './verse.utils';
import { FinalResponse, FullChapter } from '../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Fixtures mirror the structure of bible.com pages (hashed CSS module class names included)
const page = (main: string): string =>
	`<html><head><title>Bible App</title></head><body><main class="flex-1">${main}</main></body></html>`;

const VERSE_PAGE = page(`
	<h1>John 3:16</h1>
	<div><a href="/bible/111/JHN.3.16.NIV">NIV</a><a href="/bible/1/JHN.3.16.KJV">KJV</a></div>
	<p class="text-16 mbe-4 font-medium">For God so loved the world,
		that he gave his only begotten Son .</p>
	<p class="font-medium">Compare All Versions: John 3:16</p>
`);

const NO_VERSES_PAGE = page(`
	<h1>John 3:99</h1>
	<p class="text-center">No Available Verses</p>
`);

const CHAPTER_PAGE = page(`
	<div class="cat7xG_chapter" data-usfm="JHN.3">
		<div class="cat7xG_label">3</div>
		<div class="cat7xG_s"><span class="cat7xG_heading">Entretien de Jésus avec Nicodème</span></div>
		<div class="cat7xG_r"><span class="cat7xG_heading">V. 1-13: cf. </span>Ga 6:15</div>
		<div class="cat7xG_p">
			<span class="cat7xG_verse" data-usfm="JHN.3.1"><span class="cat7xG_label">1</span><span class="cat7xG_content">Mais il y eut un homme, nommé </span><span class="cat7xG_note cat7xG_x"><span class="cat7xG_label">#</span><span class="cat7xG_body"><span class="ref" data-usfm="JHN.3.19">Jn 3:19</span>.</span></span><span class="cat7xG_content">Nicodème,</span></span>
			<span class="cat7xG_verse" data-usfm="JHN.3.2"><span class="cat7xG_label">2</span><span class="cat7xG_content">qui vint de nuit</span></span>
		</div>
		<div class="cat7xG_p">
			<span class="cat7xG_verse" data-usfm="JHN.3.2"><span class="cat7xG_content">auprès de Jésus.</span></span>
			<span class="cat7xG_verse" data-usfm="JHN.3.3"><span class="cat7xG_label">3</span><span class="cat7xG_content">Jésus lui répondit: </span><span class="cat7xG_wj"><span class="cat7xG_content">En vérité.</span></span></span>
			<span class="cat7xG_verse" data-usfm="JHN.3.4+JHN.3.5"><span class="cat7xG_label">4-5</span><span class="cat7xG_content">Versets combinés.</span></span>
			<span class="cat7xG_verse" data-usfm="JHN.3.6"><span class="cat7xG_label">6</span><span class="cat7xG_content">  </span></span>
		</div>
	</div>
`);

const CHAPTER_PAGE_WITHOUT_HEADING = page(`
	<div class="abc123_chapter" data-usfm="PSA.23">
		<div class="abc123_q1"><span class="abc123_verse" data-usfm="PSA.23.1"><span class="abc123_label">1</span><span class="abc123_content">The LORD is my shepherd; I shall not want.</span></span></div>
	</div>
`);

const TODAY_PAGE = page(`
	<h1>Verse of the Day</h1>
	<a href="/bible/111/RUT.1.16.NIV">But Ruth replied,
		“Where you go I will go.”</a>
	<a href="/bible/111/RUT.1.16.NIV">Ruth 1:16 (NIV)</a>
	<a href="/bible/111/RUT.1.16.NIV">Read Ruth 1:16</a>
	<a href="/bible/compare/PSA.24.1">The earth is the LORD’s</a>
	<a href="/bible/111/PSA.24.1">Psalm 24:1 (NIV)</a>
`);

const mockPage = (html: string) => mockedAxios.get.mockResolvedValueOnce({ data: html });

// fetchVerses resolves to `any`; narrow it to the shape each branch returns
const fetchPassage = async (...args: Parameters<typeof fetchVerses>) =>
	(await fetchVerses(...args)) as FinalResponse;
const fetchChapter = async (...args: Parameters<typeof fetchVerses>) =>
	(await fetchVerses(...args)) as FullChapter;

describe('verse.utils', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		jest.spyOn(console, 'error').mockImplementation(() => undefined);
		jest.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('getFinalLanguage', () => {
		it('defaults to English when no language is provided', () => {
			expect(getFinalLanguage(undefined)).toBe('en');
		});

		it('keeps a supported language', () => {
			expect(getFinalLanguage('fr')).toBe('fr');
		});

		it('falls back to English for an unsupported language', () => {
			expect(getFinalLanguage('de')).toBe('en');
		});
	});

	describe('fetchVerses', () => {
		const URL = 'https://www.bible.com/bible/1/JHN.3.16';

		it('fetches the page with a timeout and a browser User-Agent', async () => {
			mockPage(VERSE_PAGE);

			await fetchVerses(URL, 'John', '3', '16', 'KJV');

			const [calledUrl, config] = mockedAxios.get.mock.calls[0];
			expect(calledUrl).toBe(URL);
			expect(config?.timeout).toBe(8000);
			expect(config?.headers?.['User-Agent']).toEqual(expect.stringContaining('Mozilla'));
		});

		it('returns the citation from the page title and the cleaned passage', async () => {
			mockPage(VERSE_PAGE);

			await expect(fetchVerses(URL, 'John', '3', '16', 'KJV')).resolves.toEqual({
				citation: 'John 3:16 (KJV)',
				passage: 'For God so loved the world, that he gave his only begotten Son.',
			});
		});

		it('builds the citation from the arguments when the page has no title', async () => {
			mockPage(VERSE_PAGE.replace('<h1>John 3:16</h1>', ''));

			const result = await fetchPassage(URL, 'John', '3', '16-18', 'KJV');

			expect(result.citation).toBe('John 3:16-18 (KJV)');
		});

		it('returns an Error when the page has no passage', async () => {
			mockPage(page('<h1>John 3:16</h1>'));

			const result: unknown = await fetchVerses(URL, 'John', '3', '16', 'KJV');

			expect(result).toBeInstanceOf(Error);
		});

		it('rejects when bible.com has no verses for the reference', async () => {
			mockPage(NO_VERSES_PAGE);

			await expect(fetchVerses(URL, 'John', '3', '99', 'KJV')).rejects.toThrow('Something went wrong');
		});

		it('ignores "No Available Verses" when it only appears outside a paragraph', async () => {
			mockPage(VERSE_PAGE.replace('</main>', '</main><script>{"no_verses_available":"No Available Verses"}</script>'));

			const result = await fetchPassage(URL, 'John', '3', '16', 'KJV');

			expect(result.citation).toBe('John 3:16 (KJV)');
		});

		it('rejects when the request fails', async () => {
			mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 8000ms exceeded'));

			await expect(fetchVerses(URL, 'John', '3', '16', 'KJV')).rejects.toThrow('Something went wrong');
		});

		describe('full chapter', () => {
			const CHAPTER_URL = 'https://www.bible.com/bible/93/JHN.3';

			it('returns the section heading as title and the citation', async () => {
				mockPage(CHAPTER_PAGE);

				const result = await fetchChapter(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result.title).toBe('Entretien de Jésus avec Nicodème (LSG)');
				expect(result.citation).toBe('Jean 3 (LSG)');
			});

			it('keys verses by their number and strips labels and notes', async () => {
				mockPage(CHAPTER_PAGE);

				const result = await fetchChapter(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result.verses[1]).toBe('Mais il y eut un homme, nommé Nicodème,');
				expect(result.verses[3]).toBe('Jésus lui répondit: En vérité.');
			});

			it('does not turn cross-references to the same chapter into verses', async () => {
				mockPage(CHAPTER_PAGE);

				const result = await fetchChapter(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result.verses[19]).toBeUndefined();
			});

			it('merges a verse split across paragraphs', async () => {
				mockPage(CHAPTER_PAGE);

				const result = await fetchChapter(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result.verses[2]).toBe('qui vint de nuit auprès de Jésus.');
			});

			it('keys combined verses by their first number and skips empty verses', async () => {
				mockPage(CHAPTER_PAGE);

				const result = await fetchChapter(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result.verses[4]).toBe('Versets combinés.');
				expect(Object.keys(result.verses)).toEqual(['1', '2', '3', '4']);
			});

			it('falls back to "book chapter" as title when there is no heading', async () => {
				mockPage(CHAPTER_PAGE_WITHOUT_HEADING);

				const result = await fetchChapter(CHAPTER_URL, 'Psalms', '23', '-1', 'KJV');

				expect(result).toEqual({
					title: 'Psalms 23 (KJV)',
					verses: { 1: 'The LORD is my shepherd; I shall not want.' },
					citation: 'Psalms 23 (KJV)',
				});
			});

			it('returns an Error when the page has no chapter', async () => {
				mockPage(VERSE_PAGE);

				const result: unknown = await fetchVerses(CHAPTER_URL, 'Jean', '3', '-1', 'LSG');

				expect(result).toBeInstanceOf(Error);
			});
		});
	});

	describe('fetchTodayVerse', () => {
		const URL = 'https://www.bible.com/en/verse-of-the-day';

		it('returns the first citation link and the passage linking to the same verse', async () => {
			mockPage(TODAY_PAGE);

			await expect(fetchTodayVerse(URL)).resolves.toEqual({
				citation: 'Ruth 1:16 (NIV)',
				passage: 'But Ruth replied, “Where you go I will go.”',
			});
		});

		it('rejects when the page has no citation link', async () => {
			mockPage(page('<h1>Verse of the Day</h1><a href="/bible/111/RUT.1.16.NIV">But Ruth replied</a>'));

			await expect(fetchTodayVerse(URL)).rejects.toThrow('Something went wrong');
		});

		it('rejects when the citation link has no matching passage', async () => {
			mockPage(page('<a href="/bible/111/RUT.1.16.NIV">Ruth 1:16 (NIV)</a>'));

			await expect(fetchTodayVerse(URL)).rejects.toThrow('Something went wrong');
		});

		it('rejects when the request fails', async () => {
			mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

			await expect(fetchTodayVerse(URL)).rejects.toThrow('Something went wrong');
		});
	});
});
