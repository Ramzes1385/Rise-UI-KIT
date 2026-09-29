/** Утилиты: навигация и открытие внешних ссылок */

import { isSafeUrl } from '@utils/data/urlUtils'
import type { NavigateOptions } from './types/navigationUtils.types'

/**
 * Ссылки приходят из данных (пункты меню, CMS, API). `javascript:` в href исполнился бы
 * и через `location.href`, и через `window.open` (новое окно наследует origin страницы),
 * поэтому небезопасные схемы не открываются.
 */
function warnUnsafeUrl(url: string): void {
	console.warn(`[rise-ui-kit] Переход по небезопасному URL заблокирован: ${url.slice(0, 80)}`)
}

function openExternalUrl(url: string, target: '_blank' | '_self' = '_blank'): void {
	if (!isSafeUrl(url)) {
		warnUnsafeUrl(url)
		return
	}
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
		if (!isSafeUrl(options.href)) {
			warnUnsafeUrl(options.href)
			return
		}
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
