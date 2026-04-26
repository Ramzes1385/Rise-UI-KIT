import type { NavigateOptions } from './navigationUtils.types'

/** Открыть внешнюю ссылку безопасно (noopener) */
function openExternalUrl(url: string, target: '_blank' | '_self' = '_blank'): void {
	window.open(url, target, target === '_blank' ? 'noopener' : undefined)
}

/** Определить тип навигации и вернуть маршрут */
function resolveNavigation(options: NavigateOptions): { type: 'internal' | 'external' | 'none'; url: string } {
	if (options.href) return { type: 'external', url: options.href }
	if (options.to) return { type: 'internal', url: options.to }
	return { type: 'none', url: '' }
}

export { openExternalUrl, resolveNavigation }
