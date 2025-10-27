import { Injectable } from '@nestjs/common';
import versions from '../core/db/versions.json';
import { VersionInfo } from 'src/core/types';
import { GetVerseDto } from './dto/get-verse.dto';

const defaultVersion: { [key: string]: VersionInfo } = {
	en: {
		id: 1,
		name: 'KJV',
	},
	fr: {
		id: 93,
		name: 'LSG',
	},
};
@Injectable()
export class VerseService {
	getVersion(dto: GetVerseDto): VersionInfo {
		return this.getVersioInfo(dto.version, dto.language);
	}

	private getVersioInfo(versionName: string, language: string): VersionInfo {
		// eslint-disable-next-line prettier/prettier
		const languageVersions = versions[language] as { [key: string]: VersionInfo };
		console.log(languageVersions);

		if (!languageVersions) {
			return defaultVersion[language] || defaultVersion['en'];
		}

		const foundKey = Object.keys(languageVersions).find(
			(key) =>
				key.toLocaleUpperCase() === versionName.toLocaleUpperCase(),
		);

		if (foundKey) {
			return languageVersions[foundKey];
		}

		return defaultVersion[language] || defaultVersion['en'];
	}
}
