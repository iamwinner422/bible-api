import versions from '../db/versions.json';
import books from '../db/books.json';

import { APOCRYPHE_BOOKS_ALIASES, BookInfo, VersionInfo, VERSIONS_WITH_APOCRYPHE_BOOKS } from '../types';
import { DEFAULT_VERSIONS } from '../constants';
import { getRandomIntInclusive } from './index';

export const getVersionInfo = (version: string, language: string): VersionInfo | undefined => {
	const languageVersions = versions[language] as VersionInfo[];

	if (!languageVersions) {
		return undefined;
	}
	return languageVersions.find(
		(versionInfo: VersionInfo) => versionInfo.name.toLowerCase() === version.toLowerCase()
	);
}

export const getVersionInfoStandalone = (version: string): VersionInfo | undefined => {
	const availableVersions = versions as Record<string, VersionInfo[]>;
	for (const language in availableVersions){
		const found = availableVersions[language].find(
			(versionInfo: VersionInfo) => versionInfo.name.toLowerCase() === version.toLowerCase()
		);

		if (found) return { ...found, language };
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

export const getFinalVersion = (providedVersion: string | undefined, language: string): VersionInfo | undefined => {
	if(providedVersion){
		const finalVersion = getVersionInfo(providedVersion, language);

		if(!finalVersion){
			return getVersionInfoStandalone(providedVersion)
		}

		return finalVersion;
	}else{
		return DEFAULT_VERSIONS[language]
	}

}

export const getRandomBook = (language: string, version: VersionInfo): BookInfo => {
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
