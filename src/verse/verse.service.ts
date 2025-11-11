import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { GetVerseDto } from './dto/get-verse.dto';
import {
	BIBLE_APP_URL,
	DEFAULT_VERSIONS,
	SUPPORTED_LANGUAGES,
} from '../core/constants';
import { GetRandomVerseDto } from './dto/get-random-verse.dto';
import { fetchVerses } from '../core/utils/verse.utils';
import { getBookInfo, getVersionInfo, getVersionInfoStandlone } from '../core/utils/db.utils';
import books from '../core/db/books.json';
import {
	APOCRYPHE_BOOKS_ALIASES,
	BookInfo,
	FullChapter,
	Languages,
	VersionInfo,
	VERSIONS_WITH_APOCRYPHE_BOOKS
} from '../core/types';
import { getRandomIntInclusive } from '../core/utils';
import { TodayVerseDto } from './dto/today-verse.dto';


@Injectable()
export class VerseService {
	getVerse(verseDto: GetVerseDto) {
		const { book, chapter, verses, version, language } = verseDto;
		try {
			// check if language is correct
			if (!SUPPORTED_LANGUAGES.includes(language)) {
				return new BadRequestException('Provided language not supported');
			}

			const foundedVersion = getVersionInfo(version, language) ?? DEFAULT_VERSIONS[language];
			const foundVersionName = foundedVersion.name;
			const foundedBook = getBookInfo(book, language);

			// check if book is correct
			if (!foundedBook) {
				return new BadRequestException('Book not found');
			}

			const URL =
				verses == '-1'
					? `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}`
					: `${BIBLE_APP_URL}/${foundedVersion.id}/${foundedBook.alias}.${chapter}.${verses}`;

			return fetchVerses(URL, book, chapter, verses, foundVersionName);
		} catch (error) {
			console.log(error);
			return new InternalServerErrorException('Something went wrong');
		}
	}

	async getRandomVerse(randomVerseDto: GetRandomVerseDto) {
		const { language, version } = randomVerseDto;
		let finalLanguage = this.getFinalLanguage(language);
		const finalVersion = this.getFinalVersion(version, finalLanguage)

		if(!finalVersion){
			return new BadRequestException('Provided version not found');
		}

		// SET THE VERSION FROM FOUNDED VERSION
		finalLanguage = finalVersion.language || finalLanguage

		// GET RANDOM BOOK
		const selectedBook = this.getRandomBook(finalLanguage, finalVersion);

		// GET RANDOM CHAPTHER
		const selectedChapter = getRandomIntInclusive(1, selectedBook.chapters);

		const URL = `${BIBLE_APP_URL}/${finalVersion.id}/${selectedBook.alias}.${selectedChapter}`;
		Logger.log(URL)

		const fetchedVerses = await fetchVerses(URL, selectedBook.book, selectedChapter.toString(), '-1', finalVersion.name) as FullChapter ;

		// GET CHAPTER SIZE AND VERSE INDEX
		const chapterSize = Object.keys(fetchedVerses.verses).length;
		const selectedVerseIndex = getRandomIntInclusive(1, chapterSize);

		const selectedVerse = fetchedVerses.verses[selectedVerseIndex]

		return {
			citation: `${selectedBook.book} ${selectedChapter}:${selectedVerseIndex} (${finalVersion.name})`,
			passage: selectedVerse,
		}
	}

	getTodayVerse(todayVerseDto: TodayVerseDto){
		const { language } = todayVerseDto;
	}
	private getFinalLanguage(providedLanguage: string | undefined): string {
		return providedLanguage ? (!SUPPORTED_LANGUAGES.includes(providedLanguage)) ? Languages.EN : providedLanguage : Languages.EN;
	}

	private getFinalVersion(providedVersion: string | undefined, language: string): VersionInfo | undefined {
		if(providedVersion){
			const finalVersion = getVersionInfo(providedVersion, language);

			if(!finalVersion){
				return getVersionInfoStandlone(providedVersion)
			}

			return finalVersion;
		}else{
			return DEFAULT_VERSIONS[language]
		}

	}

	private getRandomBook(language: string, version: VersionInfo): BookInfo {
		const languageBooks = books[language] as BookInfo[];
		let randomBookIndex = getRandomIntInclusive(0, languageBooks.length - 1);
		let selectedBook = languageBooks[randomBookIndex];

		// SKIP APOCRYPHE BOOKS WHEN THE VERSION DOESN'T CONTAIN THEM
		while (
			!VERSIONS_WITH_APOCRYPHE_BOOKS.includes(version.name) &&
			APOCRYPHE_BOOKS_ALIASES.includes(selectedBook.alias)
		) {
			randomBookIndex = getRandomIntInclusive(0, languageBooks.length - 1);
			selectedBook = languageBooks[randomBookIndex];
		}
		return selectedBook;
	}
}
