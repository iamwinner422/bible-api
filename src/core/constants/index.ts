import { Languages, VersionInfo } from "../types";

export const BIBLE_APP_URL = 'https://www.bible.com/bible';

export const DEFAULT_VERSIONS: { [key: string]: VersionInfo } = {
	en: {
		id: 1,
		name: 'KJV',
		language: Languages.EN
	},
	fr: {
		id: 93,
		name: 'LSG',
		language: Languages.FR
	},
};

export const SUPPORTED_LANGUAGES: string[] = ['en', 'fr'];
