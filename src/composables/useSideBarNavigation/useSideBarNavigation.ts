/** Composable: навигация сайдбара (раскрытие групп, активный пункт, обработка кликов) */
import { ref } from 'vue'
import type { UseSideBarNavigationOptions } from './useSideBarNavigation.types'
import type {
	BaseSideBarItemSlotProps,
	SideBarItem,
	SideBarItemKey,
	SideBarItemTo,
} from '@components/BaseSideBar/model/BaseSideBar.types'
import type { Component } from 'vue'

/** Описание: обеспечивает навигацию сайдбара — раскрытие/сворачивание групп, определение активного пункта, генерация пропсов и обработка кликов */
function useSideBarNavigation(options: UseSideBarNavigationOptions) {
	const { props, emit } = options

	const expandedItemKeys = ref(new Set<SideBarItemKey>())

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

	function getItemComponent(item: SideBarItem): string | Component {
		if (item.isDisabled || !item.to) {
			return 'button'
		}

		return props.linkComponent ?? 'a'
	}

	function getItemProps(item: SideBarItem): Record<string, unknown> {
		if (item.isDisabled || !item.to) {
			return {
				type: 'button',
				disabled: item.isDisabled,
			}
		}

		if (props.linkComponent === 'a') {
			return {
				href: getHref(item.to),
			}
		}

		return {
			to: item.to,
		}
	}

	function hasChildren(item: SideBarItem): boolean {
		return Boolean(item.children?.length)
	}

	function isDisclosureItem(item: SideBarItem): boolean {
		return hasChildren(item) && !item.to
	}

	function hasActiveChild(item: SideBarItem): boolean {
		return item.children!.some(child => isItemActive(child))
	}

	function isItemExpanded(item: SideBarItem): boolean {
		if (item.isDisabled) {
			return false
		}

		if (!isDisclosureItem(item)) {
			return true
		}

		return hasActiveChild(item) || expandedItemKeys.value.has(getItemKey(item))
	}

	function shouldRenderChildren(item: SideBarItem): boolean {
		return hasChildren(item) && !props.isCollapsed && isItemExpanded(item)
	}

	function getItemAriaExpanded(item: SideBarItem): boolean | undefined {
		if (props.isCollapsed || !isDisclosureItem(item)) {
			return undefined
		}

		return isItemExpanded(item)
	}

	function toggleItemExpanded(item: SideBarItem): void {
		const itemKey = getItemKey(item)
		const nextExpandedItemKeys = new Set(expandedItemKeys.value)

		if (nextExpandedItemKeys.has(itemKey)) {
			nextExpandedItemKeys.delete(itemKey)
		} else {
			nextExpandedItemKeys.add(itemKey)
		}

		expandedItemKeys.value = nextExpandedItemKeys
	}

	function isItemActive(item: SideBarItem): boolean {
		if (isCurrentItemActive(item)) {
			return true
		}

		return item.children?.some(child => isItemActive(child)) ?? false
	}

	function isCurrentItemActive(item: SideBarItem): boolean {
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

	function handleClick(item: SideBarItem, event: MouseEvent): void {
		if (item.isDisabled) {
			event.preventDefault()

			return
		}

		if (isDisclosureItem(item)) {
			event.preventDefault()

			if (!props.isCollapsed) {
				toggleItemExpanded(item)
			}
		}

		item.click?.(item, event)

		emit('itemClick', item, event)
	}

	/* istanbul ignore next */
	function handleChildItemClick(item: SideBarItem, event: MouseEvent): void {
		emit('itemClick', item, event)
	}

	function getSlotProps(item: SideBarItem): BaseSideBarItemSlotProps {
		return {
			item,
			level: props.level ?? 0,
			isActive: isItemActive(item),
			isCurrent: isCurrentItemActive(item),
			isCollapsed: props.isCollapsed ?? false,
			hasChildren: hasChildren(item),
			onClick: (event: MouseEvent) => handleClick(item, event),
		}
	}

	return {
		getItemKey,
		getItemComponent,
		getItemProps,
		hasChildren,
		isDisclosureItem,
		isItemExpanded,
		shouldRenderChildren,
		getItemAriaExpanded,
		isItemActive,
		isCurrentItemActive,
		handleClick,
		handleChildItemClick,
		getSlotProps,
	}
}

export { useSideBarNavigation }
