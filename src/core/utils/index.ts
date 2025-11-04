export const cleanText = (html: string): string => {
	return html
		.replace(/\s+/g, ' ')
		.replace(/\s+([.,;:!?…»”’%])/g, '$1')
		.replace(/([«“‘({[])\s+/g, '$1')
		.replace(/\s+([»”’)}\]])/g, '$1')
		.replace(/([.,;:!?…])(?=[A-Za-zÀ-ÿ0-9])/g, '$1 ')
		.replace(/\s+/g, ' ')
		.trim();
}


export const getRandomIntInclusive = (min: number, max: number): number => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
