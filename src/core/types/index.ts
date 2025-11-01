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

