import { Injectable } from '@nestjs/common';
import versions from '../core/db/versions.json';
import books from '../core/db/books.json';
import { BookInfo, defaultVersion, VersionInfo } from 'src/core/types';
import { GetVerseDto } from './dto/get-verse.dto';

@Injectable()
export class VerseService {
	getVersion(dto: GetVerseDto): VersionInfo {
		return (
			this.getVersionInfo(dto.version, dto.language) ??
			defaultVersion[dto.language]
		);
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

		return languageBooks.find(
			(bookInfo: BookInfo) =>
				bookInfo.book.toLowerCase() === book.toLowerCase(),
		);
	}
}
