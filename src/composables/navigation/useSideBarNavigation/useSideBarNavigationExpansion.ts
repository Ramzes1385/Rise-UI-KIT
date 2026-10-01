/** Composable: раскрытие групп сайдбара и обработка кликов по пунктам */
import { ref } from 'vue'
import type { UseSideBarNavigationOptions } from './types/useSideBarNavigation.types'
import { getItemKey, isDisclosureItem, hasChildren, isItemActiveByProps } from './useSideBarNavigationUtils'
import type { BaseSideBarNavigationProps, SideBarItem, SideBarItemKey } from '@components/BaseSideBar/types/BaseSideBar.types'

/** Описание: группа раскрыта, если в ней активный пункт или её раскрыли кликом */
function createSideBarExpansion(props: BaseSideBarNavigationProps) {
	const expandedItemKeys = ref(new Set<SideBarItemKey>())

	function hasActiveChild(item: SideBarItem): boolean {
		return item.children!.some(child => isItemActiveByProps(child, props))
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

	return { isItemExpanded, shouldRenderChildren, getItemAriaExpanded, toggleItemExpanded }
}

/** Описание: клик по пункту — отмена перехода для отключённых и групп, переключение группы, события */
function createSideBarClicks(options: UseSideBarNavigationOptions, toggleItemExpanded: (item: SideBarItem) => void) {
	const { props, emit } = options

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

	return { handleClick, handleChildItemClick }
}

export { createSideBarExpansion, createSideBarClicks }
