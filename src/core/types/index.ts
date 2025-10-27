export enum SupportedLanguages {
	EN = 'en',
	FR = 'fr',
}

export interface VersionInfo {
	id: number;
	name: string;
}

export interface BookInfo {
	book: string;
	alias: string;
}

export interface Version {
	id: number;
	name: string;
}

export const defaultVersion: { [key: string]: VersionInfo } = {
	en: {
		id: 1,
		name: 'KJV',
	},
	fr: {
		id: 93,
		name: 'LSG',
	},
};
