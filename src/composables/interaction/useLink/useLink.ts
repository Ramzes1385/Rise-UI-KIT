import { warn } from '@/locales/warn'
import type { InjectionKey } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import { isExternalUrl, isSafeUrl } from '@utils/data/urlUtils'
/** Composable: ссылки кита через RouterLink приложения или `<a href>` */
import { getCurrentInstance, hasInjectionContext, inject } from 'vue'
import type { LinkComponent, LinkOptions, LinkTo, ResolvedLink } from './types/useLink.types'

/** Ключ provide/inject компонента ссылок: `createUiKitPlugin({ linkComponent: RouterLink })` */
export const LINK_COMPONENT_KEY: InjectionKey<LinkComponent> = Symbol.for('rise-ui-kit.link-component')

const warnedUrls = new Set<string>()

/** Адреса приходят из данных (меню, CMS, API): `javascript:` в href исполнился бы при клике */
function warnUnsafe(url: string): void {
	if (warnedUrls.has(url)) return
	warnedUrls.add(url)
	warn(UI_WARNINGS.LINK_UNSAFE_URL, { url: url.slice(0, 80) })
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

/** Ссылка без адреса: выключенная, с небезопасным адресом или объект `to` без компонента ссылок */
function linkWithoutAddress(): ResolvedLink {
	return { is: 'a', attrs: { 'aria-disabled': 'true', role: 'link' }, hasTarget: false }
}

/** Адрес безопасен для href; небезопасный — с однократным предупреждением */
function checkSafeUrl(url: string): boolean {
	if (isSafeUrl(url)) return true
	warnUnsafe(url)
	return false
}

/** Ссылка по `to`: маршрут — компонент ссылок, внешний адрес и строка без компонента ссылок — `<a href>` */
function resolveTo(to: LinkTo, linkComponent: LinkComponent, attrs: { target?: string; rel?: string }): ResolvedLink {
	if (typeof to === 'string' && !checkSafeUrl(to)) return linkWithoutAddress()
	// Внешний адрес в `to` (https://…, mailto:) роутер принял бы за путь — это обычная ссылка
	const isRoute = typeof to !== 'string' || !isExternalUrl(to)
	if (linkComponent !== 'a' && isRoute) return { is: linkComponent, attrs: { to, ...attrs }, hasTarget: true }
	if (typeof to !== 'string') {
		warn(UI_WARNINGS.LINK_WITHOUT_COMPONENT)
		return linkWithoutAddress()
	}
	return { is: 'a', attrs: { href: to, ...attrs }, hasTarget: true }
}

/**
 * Тег и атрибуты ссылки. `href` и внешний адрес в `to` — всегда `<a>`; маршрут в `to` — компонент ссылок
 * (`to`) или `<a href>` для строки.
 * Небезопасная схема (`javascript:`, `data:`) и объект `to` без компонента ссылок дают ссылку без адреса.
 */
export function resolveLink(options: LinkOptions, linkComponent: LinkComponent = 'a'): ResolvedLink {
	if (options.isDisabled) return linkWithoutAddress()
	const attrs = { target: options.target, rel: mergeRel(options.rel, options.target) }
	if (options.href !== undefined) {
		if (!checkSafeUrl(options.href)) return linkWithoutAddress()
		return { is: 'a', attrs: { href: options.href, ...attrs }, hasTarget: true }
	}
	if (options.to === undefined) return linkWithoutAddress()
	return resolveTo(options.to, linkComponent, attrs)
}
