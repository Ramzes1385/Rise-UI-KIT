/** Composable: пункт сайдбара как ссылка или кнопка (компонент, атрибуты, отсев небезопасных адресов) */
import type { Component } from 'vue'
import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import { isSafeUrl } from '@utils/data/urlUtils'
import { getHref, isExternalItem } from './useSideBarNavigationUtils'
import type { BaseSideBarNavigationProps, SideBarItem } from '@components/BaseSideBar/types/BaseSideBar.types'

/** Описание: элемент и атрибуты пункта; предупреждение о небезопасном адресе — один раз на адрес */
function createSideBarLinks(props: BaseSideBarNavigationProps) {
	/** Адреса, о которых уже предупредили: пропсы пункта пересчитываются при каждом рендере */
	const warnedUnsafeUrls = new Set<string>()

	/**
	 * Пункт становится ссылкой, только если он активен и его адрес безопасен. Строковый `to` приходит из данных
	 * (CMS, API): `javascript:` в href исполнился бы по клику, поэтому такой пункт остаётся кнопкой.
	 */
	function isLinkItem(item: SideBarItem): boolean {
		if (item.isDisabled || !item.to) return false
		if (typeof item.to !== 'string' || isSafeUrl(item.to)) return true
		if (!warnedUnsafeUrls.has(item.to)) {
			warnedUnsafeUrls.add(item.to)
			warn(UI_WARNINGS.SIDEBAR_UNSAFE_URL, { label: item.label, url: item.to.slice(0, 80) })
		}
		return false
	}

	function getItemComponent(item: SideBarItem): string | Component {
		if (!isLinkItem(item)) {
			return 'button'
		}

		return isExternalItem(item) ? 'a' : (props.linkComponent ?? 'a')
	}

	function getItemProps(item: SideBarItem): Record<string, unknown> {
		if (!isLinkItem(item)) {
			return {
				type: 'button',
				disabled: item.isDisabled,
			}
		}

		if (props.linkComponent === 'a' || isExternalItem(item)) {
			return {
				href: getHref(item.to!),
			}
		}

		return {
			to: item.to,
		}
	}

	return { getItemComponent, getItemProps }
}

export { createSideBarLinks }
