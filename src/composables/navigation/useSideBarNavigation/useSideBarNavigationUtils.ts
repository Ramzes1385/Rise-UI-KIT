/** Утилиты: ключ, иерархия и активность пунктов сайдбара */
import { isExternalUrl } from '@utils/data/urlUtils'
import type {
	BaseSideBarNavigationProps,
	SideBarItem,
	SideBarItemKey,
	SideBarItemTo,
} from '@components/BaseSideBar/types/BaseSideBar.types'

function getHref(to: SideBarItemTo): string {
	return typeof to === 'string' ? to : '#'
}

function getItemToString(to: SideBarItemTo | undefined): string | undefined {
	/* istanbul ignore if */
	if (!to) {
		return undefined
	}

	/* istanbul ignore if */
	if (typeof to === 'string') {
		return to
	}

	try {
		return JSON.stringify(to)
	} catch /* istanbul ignore next */ {
		return undefined
	}
}

function getItemKey(item: SideBarItem): SideBarItemKey {
	if (item.key !== undefined) {
		return item.key
	}

	const itemToString = getItemToString(item.to)

	if (itemToString !== undefined) {
		return itemToString
	}

	return item.label
}

/** Внешний адрес (https://…, mailto:) — обычная ссылка: роутер принял бы его за путь */
function isExternalItem(item: SideBarItem): boolean {
	return typeof item.to === 'string' && isExternalUrl(item.to)
}

function hasChildren(item: SideBarItem): boolean {
	return Boolean(item.children?.length)
}

function isDisclosureItem(item: SideBarItem): boolean {
	return hasChildren(item) && !item.to
}

function isCurrentItemActiveByProps(item: SideBarItem, props: BaseSideBarNavigationProps): boolean {
	if (item.isActive) {
		return true
	}

	if (item.key !== undefined && props.activeKey !== undefined) {
		return item.key === props.activeKey
	}

	if (!props.activePath || !item.to || typeof item.to !== 'string') {
		return false
	}

	if (props.activePath === item.to) {
		return true
	}

	if (props.activeMatch === 'startsWith' && !hasChildren(item)) {
		return props.activePath.startsWith(`${item.to}/`)
	}

	return false
}

function isItemActiveByProps(item: SideBarItem, props: BaseSideBarNavigationProps): boolean {
	if (isCurrentItemActiveByProps(item, props)) {
		return true
	}

	return item.children?.some(child => isItemActiveByProps(child, props)) ?? false
}

export { getHref, getItemKey, isExternalItem, hasChildren, isDisclosureItem, isCurrentItemActiveByProps, isItemActiveByProps }
