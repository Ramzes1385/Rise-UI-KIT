import { computed, ref } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import { useSideBarItemView } from './useSideBarItemView'
import { useSideBarNavigation } from '@composables/navigation/useSideBarNavigation'
import type { BaseSideBarNavigationEmits, BaseSideBarNavigationProps, SideBarItem } from '../types/BaseSideBar.types'

export function useBaseSideBarNavigation(props: BaseSideBarNavigationProps, emit: BaseSideBarNavigationEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const navigation = useSideBarNavigation({ props, emit })
	const view = useSideBarItemView(props, (item: SideBarItem, event: Event) => {
		item.click?.(item, event as MouseEvent)
		emit('itemClick', item, event as MouseEvent)
	})

	return {
		...navigation,
		...view,
		rootRef,
		isExpandInstant: computed(() => motion.isReduced.value || Boolean(props.isCollapsed)),
		getItemAriaControls: (item: SideBarItem, index: number) =>
			navigation.isDisclosureItem(item) && navigation.shouldRenderChildren(item) ? view.getChildrenId(index) : undefined,
		getItemComponent: (item: SideBarItem) => (view.hasFlyout(item) ? 'button' : navigation.getItemComponent(item)),
		getItemProps: (item: SideBarItem) => (view.hasFlyout(item) ? { type: 'button' } : navigation.getItemProps(item)),
		getFlyoutProps: (item: SideBarItem) =>
			view.hasFlyout(item) ? { items: view.getFlyoutItems(item), position: 'right-start', ariaLabel: item.label } : {},
	}
}
