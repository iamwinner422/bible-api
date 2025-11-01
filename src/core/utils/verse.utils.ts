import { NextData, Verse } from '../types';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanText } from './index';

export const fetchVerses = async (
	url: string,
	book: string,
	chapter: string,
	verses: string,
	version: string
): Promise<any> => {
	try {
		const { data } = await axios.get<string>(url, {
			timeout: 8000,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 11.00; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0',
			},
		});

		const $ = cheerio.load(data);

		if ($("p:contains('No Available Verses')").length) {
			return new Error('Verses not found');
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
