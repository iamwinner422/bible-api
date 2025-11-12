import { Languages, NextData, Verse } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanText } from './index';
import { SUPPORTED_LANGUAGES } from '../constants';

const fetchFromUrl = async (url: string): Promise<string> => {
	const { data } = await axios.get<string>(url, {
		timeout: 8000,
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 11.00; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0',
		},
	});
	return data;
}

export const getFinalLanguage = (providedLanguage: string | undefined): string => {
	return providedLanguage ? (!SUPPORTED_LANGUAGES.includes(providedLanguage)) ? Languages.EN : providedLanguage : Languages.EN;
}

export const fetchVerses = async (
	url: string,
	book: string,
	chapter: string,
	verses: string,
	version: string
): Promise<any> => {
	try {

		const data = await fetchFromUrl(url);
		const $ = cheerio.load(data);

		if ($("p:contains('No Available Verses')").length) {
			throw new Error('Verses not found');
		}

		const nextScript = $("script#__NEXT_DATA__").first();
		if (nextScript.length) {
			const json = JSON.parse(nextScript.html() || '') as NextData;

			if (verses !== '-1') {
				const verseData = json.props.pageProps.verses?.[0];
				if (!verseData)
					return new Error('Verse not found in JSON data.')

				const passage = cleanText(cheerio.load(verseData.content).text());
				const reference = verseData.reference.human;

				return {
					citation: `${reference} (${version})`,
					passage,
				};
			}

			const chapterHtml = json.props.pageProps.chapterInfo?.content;
			if (!chapterHtml)
				return new Error('Chapter content not found.')

			const chapter$ = cheerio.load(chapterHtml);
			const title =
				chapter$('.heading').first().text().trim() ||
				chapter$('.d').first().text().trim() ||
				`${book} ${chapter}`;

			const versesArray: Verse[] = [];
			const paverses = chapterHtml.split(/<span class="label">\d+<\/span>/g);
			const titleText = cheerio.load(paverses[0])('.heading').text();
			paverses.shift();

			paverses.forEach((verse: string, index: number) => {
				const verseNumber = index + 1;
				let verseText = cheerio.load(verse)('.content').text();

				verseText = cleanText(verseText);
				if (verseText)
					versesArray.push({
						number: verseNumber,
						content: verseText,
					});
			});

			const versesObj = versesArray.reduce(
				(acc: Record<number, string>, verse) => {
					acc[verse.number] = verse.content;
					return acc;
				},
				{},
			);

			return {
				title: `${titleText || title} (${version})`,
				verses: versesObj,
				citation: `${book} ${chapter} (${version})`,
			};
		}

		const wrapper = $('.text-17');
		const versesArray: string[] = [];

		wrapper.each((_, p) => {
			const text = cleanText($(p).text());
			if (text) versesArray.push(text);
		});

		return {
			citation: `${book} ${chapter}:${verses} (${version})`,
			passage: versesArray[0] || '',
		};
	} catch (err) {
		console.error('Error fetching or parsing verse:', err);
		throw new Error('Something went wrong')
	}
}


export const fetchTodayVerse = async (url: string): Promise<any> => {
	try {
		const data = await fetchFromUrl(url);
		const $ = cheerio.load(data);

		const nextScript = $("script#__NEXT_DATA__").first();
		if (nextScript.length) {
			const json = JSON.parse(nextScript.html() || '') as NextData;
			const pageProps = json.props.pageProps;

			if (pageProps.verses && pageProps.verses.length > 0) {
				const firstVerse = pageProps.verses[0];
				const verse = cleanText(firstVerse.content);
				const reference = firstVerse.reference.human;
				const version = pageProps.versionData?.abbreviation;

				return {
					citation: `${reference} (${version})`,
					passage: verse,
				}
			} else {
				console.log('Verse data not found in JSON data.');
				throw new Error('Today\'s verse not found');
			}
		}else {
			const versesArray: string[] = [];
			const citationsArray: Array<string> = [];
			let version: string = '';

			const verses = $("a.text-text-light.w-full.no-underline");
			const citations = $("p.text-gray-25");
			citations.each((i, p) => {
				let citation = $(p).eq(0).text();

				version = citation.slice(-4).replace(/[()]/g, "");

				citation = citation.slice(0, -6);

				citationsArray.push(citation);
			});

			verses.each((i, p) => {
				const unformattedVerse = $(p).eq(0).text();
				const formattedVerse = cleanText(unformattedVerse);
				versesArray.push(formattedVerse);
			});

			return {
				citation: `${citationsArray[0]} (${version})`,
				passage: versesArray[0],
			}
		}
	} catch (err) {
		console.error('Error fetching or parsing verse:', err);
		throw new Error('Something went wrong')
	}
}
