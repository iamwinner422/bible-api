import versions from '../db/versions.json';
import books from '../db/books.json';

import { BookInfo, VersionInfo } from '../types';

export const getVersionInfo = (version: string, language: string): VersionInfo | undefined => {
	const languageVersions = versions[language] as VersionInfo[];

	if (!languageVersions) {
		return undefined;
	}
	return languageVersions.find(
		(versionInfo: VersionInfo) => versionInfo.name.toLowerCase() === version.toLowerCase()
	);
}

export const getVersionInfoStandlone = (version: string): VersionInfo | undefined => {
	const availbleVersions = versions as Record<string, VersionInfo[]>;
	for (const language in availbleVersions){
		const found = availbleVersions[language].find(
			(versionInfo: VersionInfo) => versionInfo.name.toLowerCase() === version.toLowerCase()
		);

		return found;
	}

	return undefined;
}

export const getBookInfo = (book: string, language: string): BookInfo | undefined => {
	const languageBooks = books[language] as BookInfo[];

	if (!languageBooks) {
		return undefined;
	}

	return (
		languageBooks.find(
			(bookInfo: BookInfo) => bookInfo.book.toLowerCase() === book.toLowerCase(),
		) ||
		languageBooks.find((bookInfo: BookInfo) =>
			bookInfo.alias.includes(book.toUpperCase()),
		)
	);
}
