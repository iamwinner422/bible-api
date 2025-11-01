import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import versions from '../core/db/versions.json';
import books from '../core/db/books.json';
import { BookInfo, Verse, VersionInfo } from 'src/core/types';
import { GetVerseDto } from './dto/get-verse.dto';
import {
	BIBLE_APP_URL,
	DEFAULT_VERSIONS,
	SUPPORTED_LANGUAGES,
} from 'src/core/constants';
import axios from 'axios';
import { Cheerio } from 'cheerio';
import * as cheerio from 'cheerio';

interface NextData {
	props: {
		pageProps: {
			initialState?: any; // Make optional if not always present or directly used for content
			chapterInfo?: {
				// Add chapterInfo as it's accessed
				content: string;
			};
			verses?: Array<{
				// Add verses as it's accessed in the else branch
				content: string;
				reference: {
					human: string;
				};
			}>;
		};
	};
}

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
			const foundedBook = this.getBookInfo(book, language);

			// check if book is correct
			if (!foundedBook) {
				return new BadRequestException('Book not found');
			}

			const URL =
				verses == '-1'
					? `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}`
					: `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}.${verses}`;

			return this.fetchVerses(URL, book, chapter, verses);
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException('Something went wrong');
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
	) {
		const versesArray: Verse[] = [];
		const { data } = await axios.get<string>(url);

		const $ = cheerio.load(data);

		const unavailable = $("p:contains('No Available Verses')").text();
		if (unavailable) {
			throw new BadRequestException('Verses not found');
		}

		const nextWay: Cheerio<any> = $('script#__NEXT_DATA__').eq(0);

		if (nextWay) {
			const jsonData = JSON.parse(nextWay.html() || '') as NextData;

			if (verses == '-1') {
				if (!jsonData.props.pageProps.chapterInfo?.content) {
					throw new InternalServerErrorException(
						'Chapter content not found',
					);
				}

				const content = jsonData.props.pageProps.chapterInfo.content; // Type is now correctly inferred as string
				const fullChapter = cheerio.load(content).html();

				// Split each verse into an array.
				const paverses = fullChapter.split(
					/<span class="label">[0-9]*<\/span>/g,
				);
				const title = cheerio.load(paverses[0])('.heading').text();
				paverses.shift();

				// Verses" { "1": "...", "2": "...", ... }
				paverses.forEach((verse: string, index: number) => {
					const verseNumber = index + 1;

					verse = cheerio.load(verse)('.content').text();
					verse = verse.replace(/\n/g, ' ').trim();

					versesArray.push({
						number: verseNumber,
						content: verse,
					});
				});

				const versesObject = versesArray.reduce(
					(acc: { [key: number]: string }, verse) => {
						acc[verse.number] = verse.content;
						return acc;
					},
					{},
				);

				return {
					title: title,
					verses: versesObject,
					citation: `${book} ${chapter}`,
				};
			} else {
				if (
					!jsonData.props.pageProps.verses ||
					jsonData.props.pageProps.verses.length === 0
				) {
					throw new InternalServerErrorException(
						'Verse content not found',
					);
				}
				const verse = jsonData.props.pageProps.verses[0].content;
				const reference =
					jsonData.props.pageProps.verses[0].reference.human;

				return {
					citation: `${reference}`,
					passage: verse,
				};
			}
		} else {
			const versesArray: Array<string> = [];
			const wrapper: Cheerio<any> = $('.text-17');

			wrapper.each((i, p) => {
				const unformattedVerse = $(p).eq(0).text();
				const formattedVerse = unformattedVerse.replace(/\n/g, ' ');
				versesArray.push(formattedVerse);
			});

			return {
				citation: `${book} ${chapter}:${verses}`,
				passage: versesArray[0],
			};
		}
	}
}
