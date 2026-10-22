import { Languages, Verse } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanText } from './index';
import { SUPPORTED_LANGUAGES } from '../constants';

// bible.com hashes its CSS module class names (e.g. "cat7xG_verse"), so match on the suffix only
const CHAPTER_USFM_REGEX = /^[0-9A-Z]+\.\d+$/;
const CITATION_REGEX = /^.+ \([^()]+\)$/;

// cleanText would turn "3:16" into "3: 16", so references only get their whitespace collapsed
const cleanReference = (text: string): string => text.replace(/\s+/g, ' ').trim();

const REQUEST_TIMEOUT_MS = 4000;
const MAX_ATTEMPTS = 2;

const isRetryable = (err: unknown): boolean => {
	const { response } = err as { response?: { status: number } };
	return !response || response.status >= 500;
}

const fetchFromUrl = async (url: string, attempt = 1): Promise<string> => {
	try {
		const { data } = await axios.get<string>(url, {
			timeout: REQUEST_TIMEOUT_MS,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 11.00; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0',
			},
		});
		return data;
	} catch (err) {
		if (attempt < MAX_ATTEMPTS && isRetryable(err)) return fetchFromUrl(url, attempt + 1);
		throw err;
	}
}


const extractMain = (html: string): string => {
	const start = html.indexOf('<main');
	const end = html.indexOf('</main>', start);
	return start !== -1 && end !== -1 ? html.slice(start, end + '</main>'.length) : html;
}

const loadPage = async (url: string): Promise<cheerio.CheerioAPI> =>
	cheerio.load(extractMain(await fetchFromUrl(url)));

export const getFinalLanguage = (providedLanguage: string | undefined): string => {
	return providedLanguage ? (!SUPPORTED_LANGUAGES.includes(providedLanguage)) ? Languages.EN : providedLanguage : Languages.EN;
}

const parseChapter = ($: cheerio.CheerioAPI): { title: string; verses: Verse[] } | undefined => {
	const chapterEl = $('div[data-usfm]')
		.filter((_, el) => CHAPTER_USFM_REGEX.test($(el).attr('data-usfm') ?? ''))
		.first();
	if (!chapterEl.length) return undefined;

	const chapterUsfm = chapterEl.attr('data-usfm');

	// SECTION HEADING, SKIPPING CROSS-REFERENCE HEADINGS ("_r" BLOCKS)
	const title = cleanText(
		chapterEl
			.find('[class*="_heading"]')
			.filter((_, el) => !/_r\b/.test($(el).parent().attr('class') ?? ''))
			.first()
			.text(),
	);

	chapterEl.find('[class*="_note"], [class*="_label"]').remove();

	// A VERSE SPLIT ACROSS PARAGRAPHS APPEARS AS SEVERAL SPANS WITH THE SAME data-usfm
	const versesMap = new Map<number, string>();
	chapterEl.find(`[data-usfm^="${chapterUsfm}."]`).each((_, el) => {
		// COMBINED VERSES LOOK LIKE "JHN.3.1+JHN.3.2"; KEEP THE FIRST NUMBER
		const usfm = ($(el).attr('data-usfm') ?? '').split('+')[0];
		const verseNumber = parseInt(usfm.split('.')[2], 10);
		if (Number.isNaN(verseNumber)) return;

		versesMap.set(verseNumber, `${versesMap.get(verseNumber) ?? ''} ${$(el).text()}`);
	});

	const verses: Verse[] = [];
	versesMap.forEach((text, number) => {
		const content = cleanText(text);
		if (content) verses.push({ number, content });
	});

	return { title, verses };
}

export const fetchVerses = async (
	url: string,
	book: string,
	chapter: string,
	verses: string,
	version: string
): Promise<any> => {
	try {

		const $ = await loadPage(url);

		if ($("main p:contains('No Available Verses')").length) {
			throw new Error('Verses not found');
		}

		if (verses !== '-1') {
			const reference = cleanReference($('main h1').first().text());
			const passage = cleanText($('main p').first().text());
			if (!passage)
				return new Error('Verse not found in page.')

			return {
				citation: `${reference || `${book} ${chapter}:${verses}`} (${version})`,
				passage,
			};
		}

		const chapterData = parseChapter($);
		if (!chapterData || !chapterData.verses.length)
			return new Error('Chapter content not found.')

		const versesObj = chapterData.verses.reduce(
			(acc: Record<number, string>, verse) => {
				acc[verse.number] = verse.content;
				return acc;
			},
			{},
		);

		return {
			title: `${chapterData.title || `${book} ${chapter}`} (${version})`,
			verses: versesObj,
			citation: `${book} ${chapter} (${version})`,
		};
	} catch (err) {
		console.error('Error fetching or parsing verse:', err);
		throw new Error('Something went wrong')
	}
}


export const fetchTodayVerse = async (url: string): Promise<any> => {
	try {
		const $ = await loadPage(url);

		// THE CITATION LINK READS LIKE "Ruth 1:16 (NIV)"; THE PASSAGE LINK SHARES ITS href
		const citationLink = $('main a')
			.filter((_, a) => CITATION_REGEX.test(cleanReference($(a).text())))
			.first();
		const href = citationLink.attr('href');

		if (!href) {
			console.log('Verse data not found in page.');
			throw new Error('Today\'s verse not found');
		}

		const passage = cleanText(
			$('main a')
				.filter((_, a) => $(a).attr('href') === href && !CITATION_REGEX.test(cleanReference($(a).text())))
				.first()
				.text(),
		);

		if (!passage) {
			throw new Error('Today\'s verse not found');
		}

		return {
			citation: cleanReference(citationLink.text()),
			passage,
		}
	} catch (err) {
		console.error('Error fetching or parsing verse:', err);
		throw new Error('Something went wrong')
	}
}
