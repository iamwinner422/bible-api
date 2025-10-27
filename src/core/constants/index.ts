import { VersionInfo } from "../types";

export const BIBLE_APP_URL = 'https://www.bible.com/bible';

export const DEFAULT_VERSIONS: { [key: string]: VersionInfo } = {
	en: {
		id: 1,
		name: 'KJV',
	},
	fr: {
		id: 93,
		name: 'LSG',
	},
};

export const SUPPORTED_LANGUAGES: string[] = ['en', 'fr'];
