/** Composable: навигация сайдбара (раскрытие групп, активный пункт, обработка кликов) */
import { createSideBarLinks } from './useSideBarNavigationLinks'
import type { UseSideBarNavigationOptions } from './types/useSideBarNavigation.types'
import { createSideBarClicks, createSideBarExpansion } from './useSideBarNavigationExpansion'
import type { BaseSideBarItemSlotProps, SideBarItem } from '@components/BaseSideBar/types/BaseSideBar.types'
import { getItemKey, hasChildren, isDisclosureItem, isCurrentItemActiveByProps, isItemActiveByProps } from './useSideBarNavigationUtils'

/** Описание: обеспечивает навигацию сайдбара — раскрытие/сворачивание групп, определение активного пункта, генерация пропсов и обработка кликов */
function useSideBarNavigation(options: UseSideBarNavigationOptions) {
	const { props } = options

	const { getItemComponent, getItemProps } = createSideBarLinks(props)
	const { isItemExpanded, shouldRenderChildren, getItemAriaExpanded, toggleItemExpanded } = createSideBarExpansion(props)
	const { handleClick, handleChildItemClick } = createSideBarClicks(options, toggleItemExpanded)

	function isItemActive(item: SideBarItem): boolean {
		return isItemActiveByProps(item, props)
	}

	function isCurrentItemActive(item: SideBarItem): boolean {
		return isCurrentItemActiveByProps(item, props)
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
