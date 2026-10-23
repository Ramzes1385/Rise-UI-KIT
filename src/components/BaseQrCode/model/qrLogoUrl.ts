import { isSafeUrl } from '@utils/data/urlUtils'

const LOGO_PROTOCOLS = ['http:', 'https:', 'blob:']

const DATA_IMAGE_RE = /^data:image\/(png|jpeg|gif|webp|svg\+xml)[;,]/i

const HTTP_RE = /^https?:$/

export function isSafeLogo(href: string): boolean {
	if (isSafeUrl(href, LOGO_PROTOCOLS)) return true
	if (!isSafeUrl(href, ['data:'])) return false
	const text = href.replace(/[\t\n\r]/g, '')
	return DATA_IMAGE_RE.test(text.slice(text.toLowerCase().indexOf('data:')))
}

export function foreignOrigin(href: string): string | null {
	if (typeof window === 'undefined') return null
	try {
		const url = new URL(href, window.location.href)
		return HTTP_RE.test(url.protocol) && url.origin !== window.location.origin ? url.origin : null
	} catch {
		return null
	}
}
