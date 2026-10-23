const NON_CONTENT_TAGS = /<(?!\/?(?:img|video|hr)\b)[^>]*>/gi
const MEDIA_TAGS = /<(?:img|video|hr)\b/i
const BLANK_ENTITIES = /&nbsp;|&#160;|\s/gi

function isBlankHtml(html: string): boolean {
	if (MEDIA_TAGS.test(html)) return false
	return !html.replace(NON_CONTENT_TAGS, '').replace(BLANK_ENTITIES, '')
}

export function formFieldValue(html: string): string {
	return isBlankHtml(html) ? '' : html
}
