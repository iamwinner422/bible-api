export enum Languages {
	EN = 'en',
	FR = 'fr',
}

export interface VersionInfo {
	id: number;
	name: string;
	language?: string
}

export interface BookInfo {
	book: string;
	alias: string;
	chapters: number
}

export interface Verse {
	number: number;
	content: string;
}

export interface NextData {
	props: {
		pageProps: {
			initialState?: any;
			chapterInfo?: {
				content: string;
			};
			verses?: Array<{
				content: string;
				reference: {
					human: string;
				};
			}>;
		};
	};
}

export interface FullChapter {
	title: string;
	verses: Record<number, string>;
	citation: string;
}

export const APOCRYPHE_BOOKS_ALIASES = [ 'TOB', 'JDT', 'ESG', '1MA', '2MA', 'WIS', 'SIR', 'BAR', 'LJE'];
export const VERSIONS_WITH_APOCRYPHE_BOOKS = ['PDV2017', 'BCC1923'];
