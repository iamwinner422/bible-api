import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import versions from '../core/db/versions.json';
import books from '../core/db/books.json';
import { BookInfo, NextData, Verse, VersionInfo } from '../core/types';
import { GetVerseDto } from './dto/get-verse.dto';
import {
	BIBLE_APP_URL,
	DEFAULT_VERSIONS,
	SUPPORTED_LANGUAGES,
} from '../core/constants';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { cleanText } from '../core/utils';


@Injectable()
export class VerseService {
	getVersion(verseDto: GetVerseDto) {
		const { book, chapter, verses, version, language } = verseDto;
		try {
			// check if language is correct
			if (!SUPPORTED_LANGUAGES.includes(language)) {
				return new BadRequestException('Language not supported');
			}

			const foundedVersion =
				this.getVersionInfo(version, language) ??
				DEFAULT_VERSIONS[language];
			const foundVersionName = foundedVersion.name;
			const foundedBook = this.getBookInfo(book, language);

			// check if book is correct
			if (!foundedBook) {
				return new BadRequestException('Book not found');
			}

			const URL =
				verses == '-1'
					? `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}`
					: `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}.${verses}`;

			return this.fetchVerses(URL, book, chapter, verses, foundVersionName);
		} catch (error) {
			console.log(error);
			return new InternalServerErrorException('Something went wrong');
		}
	}

	private getVersionInfo(
		version: string,
		language: string,
	): VersionInfo | undefined {
		const languageVersions = versions[language] as VersionInfo[];

		if (!languageVersions) {
			return undefined;
		}
		return languageVersions.find(
			(versionInfo: VersionInfo) =>
				versionInfo.name.toLowerCase() === version.toLowerCase(),
		);
	}

	private getBookInfo(book: string, language: string): BookInfo | undefined {
		const languageBooks = books[language] as BookInfo[];

		if (!languageBooks) {
			return undefined;
		}

		return (
			languageBooks.find(
				(bookInfo: BookInfo) =>
					bookInfo.book.toLowerCase() === book.toLowerCase(),
			) ||
			languageBooks.find((bookInfo: BookInfo) =>
				bookInfo.alias.includes(book.toUpperCase()),
			)
		);
	}

	private async fetchVerses(
		url: string,
		book: string,
		chapter: string,
		verses: string,
		version: string
	): Promise<any> {
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
				return new NotFoundException('Verses not found');
			}

			const nextScript = $("script#__NEXT_DATA__").first();
			if (nextScript.length) {
				const json = JSON.parse(nextScript.html() || '') as NextData;

				if (verses !== '-1') {
					const verseData = json.props.pageProps.verses?.[0];
					if (!verseData)
						return new NotFoundException('Verse not found in JSON data.')

					const passage = cleanText(cheerio.load(verseData.content).text());
					const reference = verseData.reference.human;

					return {
						citation: `${reference} (${version})`,
						passage,
					};
				}

				const chapterHtml = json.props.pageProps.chapterInfo?.content;
				if (!chapterHtml)
					return new NotFoundException('Chapter content not found.')

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
			throw new InternalServerErrorException('Something went wrong')
		}
	}
}
