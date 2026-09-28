/** Composable: ссылки кита через RouterLink приложения или `<a href>` */
import { getCurrentInstance, hasInjectionContext, inject } from 'vue'
import { isExternalUrl, isSafeUrl } from '@utils/urlUtils'
import type { InjectionKey } from 'vue'
import type { LinkComponent, LinkOptions, ResolvedLink } from './useLink.types'

/** Ключ provide/inject компонента ссылок: `createUiKitPlugin({ linkComponent: RouterLink })` */
export const LINK_COMPONENT_KEY: InjectionKey<LinkComponent> = Symbol.for('rise-ui-kit.link-component')

const warnedUrls = new Set<string>()

/** Адреса приходят из данных (меню, CMS, API): `javascript:` в href исполнился бы при клике */
function warnUnsafe(url: string): void {
	if (warnedUrls.has(url)) return
	warnedUrls.add(url)
	console.warn(`[rise-ui-kit] Ссылка с небезопасным адресом показана без адреса: ${url.slice(0, 80)}`)
}

function mergeRel(rel: string | undefined, target: string | undefined): string | undefined {
	if (target !== '_blank') return rel
	const parts = new Set([...(rel?.split(/\s+/).filter(Boolean) ?? []), 'noopener', 'noreferrer'])
	return [...parts].join(' ')
}

/**
 * Компонент для ссылок на маршруты приложения: проп компонента → `linkComponent` из плагина →
 * RouterLink, если в приложении подключён vue-router (он регистрирует RouterLink глобально) → `a`.
 */
export function useLinkComponent(explicit?: LinkComponent): LinkComponent {
	if (explicit) return explicit
	if (!hasInjectionContext()) return 'a'
	const fromPlugin = inject(LINK_COMPONENT_KEY, null)
	if (fromPlugin) return fromPlugin
	return getCurrentInstance()?.appContext.components.RouterLink ?? 'a'
}

/**
 * Тег и атрибуты ссылки. `href` и внешний адрес в `to` — всегда `<a>`; маршрут в `to` — компонент ссылок
 * (`to`) или `<a href>` для строки.
 * Небезопасная схема (`javascript:`, `data:`) и объект `to` без компонента ссылок дают ссылку без адреса.
 */
export function resolveLink(options: LinkOptions, linkComponent: LinkComponent = 'a'): ResolvedLink {
	const target = options.target
	const rel = mergeRel(options.rel, target)
	const disabled = { is: 'a', attrs: { 'aria-disabled': 'true', role: 'link' }, hasTarget: false }
	if (options.isDisabled) return disabled

	if (options.href !== undefined) {
		if (!isSafeUrl(options.href)) {
			warnUnsafe(options.href)
			return disabled
		}
		return { is: 'a', attrs: { href: options.href, target, rel }, hasTarget: true }
	}

	const to = options.to
	if (to === undefined) return disabled
	if (typeof to === 'string' && !isSafeUrl(to)) {
		warnUnsafe(to)
		return disabled
	}
	// Внешний адрес в `to` (https://…, mailto:) роутер принял бы за путь — это обычная ссылка
	const isRoute = typeof to !== 'string' || !isExternalUrl(to)
	if (linkComponent !== 'a' && isRoute) return { is: linkComponent, attrs: { to, target, rel }, hasTarget: true }
	if (typeof to !== 'string') {
		console.warn('[rise-ui-kit] Объект `to` без компонента ссылок: передайте RouterLink в linkComponent')
		return disabled
	}
	return { is: 'a', attrs: { href: to, target, rel }, hasTarget: true }
}
