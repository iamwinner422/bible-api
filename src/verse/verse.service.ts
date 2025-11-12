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
import {
	fetchTodayVerse,
	fetchVerses,
	getFinalLanguage,
} from '../core/utils/verse.utils';
import {
	getBookInfo,
	getFinalVersion,
	getRandomBook,
	getVersionInfo,
} from '../core/utils/db.utils';
import { FinalResponse, FullChapter } from '../core/types';
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
		let finalLanguage = getFinalLanguage(language);
		const finalVersion = getFinalVersion(version, finalLanguage)

		if(!finalVersion){
			return new BadRequestException('Provided version not found');
		}

		// SET THE VERSION FROM FOUNDED VERSION
		finalLanguage = finalVersion.language || finalLanguage

		// GET RANDOM BOOK
		const selectedBook = getRandomBook(finalLanguage, finalVersion);

		// GET RANDOM CHAPTER
		const selectedChapter = getRandomIntInclusive(1, selectedBook.chapters);

		const URL = `${BIBLE_APP_URL}/bible/${finalVersion.id}/${selectedBook.alias}.${selectedChapter}`;
		Logger.log(URL);

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

	async getTodayVerse(todayVerseDto: TodayVerseDto): Promise<FinalResponse | BadRequestException> {
		const { language } = todayVerseDto;
		const URL = `${BIBLE_APP_URL}/${language}/verse-of-the-day`;
		try {
			Logger.log(URL);
			return await fetchTodayVerse(URL) as FinalResponse;
		}
		catch (error) {
			console.log(error);
			return new BadRequestException('Can\'t get today verse');
		}
	}

}
