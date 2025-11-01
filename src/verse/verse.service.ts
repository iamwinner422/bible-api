import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { GetVerseDto } from './dto/get-verse.dto';
import {
	BIBLE_APP_URL,
	DEFAULT_VERSIONS,
	SUPPORTED_LANGUAGES,
} from '../core/constants';
import { GetRandomVerseDto } from './dto/get-random-verse.dto';
import { fetchVerses } from '../core/utils/verse.utils';
import { getBookInfo, getVersionInfo } from '../core/utils/db.utils';


@Injectable()
export class VerseService {
	getVerse(verseDto: GetVerseDto) {
		const { book, chapter, verses, version, language } = verseDto;
		try {
			// check if language is correct
			if (!SUPPORTED_LANGUAGES.includes(language)) {
				return new BadRequestException('Language not supported');
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

	getRandomVerse(randomVerseDto: GetRandomVerseDto){
		const { language, version } = randomVerseDto;
	}

}
