import type { NavigateOptions } from './navigationUtils.types'

function openExternalUrl(url: string, target: '_blank' | '_self' = '_blank'): void {
	if (typeof window.open === 'function') {
		window.open(url, target, target === '_blank' ? 'noopener' : undefined)
	}
}

function resolveNavigation(options: NavigateOptions): { type: 'internal' | 'external' | 'none'; url: string } {
	if (options.href) return { type: 'external', url: options.href }
	if (options.to) return { type: 'internal', url: options.to }
	return { type: 'none', url: '' }
}

function navigateAndEmit(options: NavigateOptions, emitNavigate: (url: string) => void): void {
	if (options.href) {
		if (options.target === '_self') {
			window.location.href = options.href
		} else {
			openExternalUrl(options.href)
		}
		emitNavigate(options.href)
	} else if (options.to) {
		emitNavigate(options.to)
	}
}

export { openExternalUrl, resolveNavigation, navigateAndEmit }
