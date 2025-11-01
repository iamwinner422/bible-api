


export const cleanText = (html: string): string => {
	return html
		.replace(/\s+/g, ' ')
		.replace(/\s+([.,;:!?])/g, '$1')
		.replace(/\s+([)"”'’\]}])/g, '$1')
		.replace(/([.,;:!?'"”’)\]}])(?=[A-Za-z0-9([{])/g, '$1 ')
		.replace(/\s+/g, ' ')
		.trim();
}


