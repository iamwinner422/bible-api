export enum Languages {
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

export interface Verse {
	number: number;
	content: string;
}

