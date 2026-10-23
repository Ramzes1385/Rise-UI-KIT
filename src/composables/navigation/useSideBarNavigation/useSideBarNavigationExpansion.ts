/** Composable: раскрытие групп сайдбара и обработка кликов по пунктам */
import { ref, watch } from 'vue'
import type { UseSideBarNavigationOptions } from './types/useSideBarNavigation.types'
import { isDisclosureItem, hasChildren, isItemActiveByProps } from './useSideBarNavigationUtils'
import type { BaseSideBarNavigationProps, SideBarItem, SideBarItemKey } from '@components/BaseSideBar/types/BaseSideBar.types'

/**
 * Описание: группа раскрыта, если её раскрыли кликом, а без выбора пользователя — если в ней активный пункт.
 * Выбор пользователя (свернул активную группу, раскрыл неактивную) действует, пока не изменится активность группы:
 * когда активный пункт появляется в группе или уходит из неё, выбор сбрасывается — группа с новым активным пунктом раскрыта
 */
function createSideBarExpansion(props: BaseSideBarNavigationProps, getKey: (item: SideBarItem) => SideBarItemKey) {
	const overrides = ref(new Map<SideBarItemKey, boolean>())

	function hasActiveChild(item: SideBarItem): boolean {
		return item.children!.some(child => isItemActiveByProps(child, props))
	}

	function getActiveGroupKeys(): SideBarItemKey[] {
		return (props.items ?? []).filter(item => isDisclosureItem(item) && hasActiveChild(item)).map(getKey)
	}

	watch(getActiveGroupKeys, (next, previous) => {
		const changed = [...next.filter(key => !previous.includes(key)), ...previous.filter(key => !next.includes(key))]
		if (!changed.some(key => overrides.value.has(key))) return
		const rest = new Map(overrides.value)
		changed.forEach(key => rest.delete(key))
		overrides.value = rest
	})

	function isItemExpanded(item: SideBarItem): boolean {
		if (item.isDisabled) {
			return false
		}

		if (!isDisclosureItem(item)) {
			return true
		}

		return overrides.value.get(getKey(item)) ?? hasActiveChild(item)
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
		const nextOverrides = new Map(overrides.value)

		nextOverrides.set(getKey(item), !isItemExpanded(item))
		overrides.value = nextOverrides
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
