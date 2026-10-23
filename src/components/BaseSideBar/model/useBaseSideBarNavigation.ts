import { computed, ref } from 'vue'
import { BaseLink } from '@components/BaseLink'
import { useMotion } from '@composables/app/useMotion'
import { mirrorSide } from '@utils/dom/directionUtils'
import { useSideBarItemView } from './useSideBarItemView'
import { useDirection } from '@composables/app/useDirection'
import { useSideBarNavigation } from '@composables/navigation/useSideBarNavigation'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'
import type { BaseSideBarNavigationEmits, BaseSideBarNavigationProps, SideBarItem } from '../types/BaseSideBar.types'

export function useBaseSideBarNavigation(props: BaseSideBarNavigationProps, emit: BaseSideBarNavigationEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const { isRtl } = useDirection(() => rootRef.value)
	const navigation = useSideBarNavigation({ props, emit })
	const view = useSideBarItemView(props, (item: SideBarItem, event: Event) => {
		item.click?.(item, event as MouseEvent)
		emit('itemClick', item, event as MouseEvent)
	})

	function isButton(item: SideBarItem): boolean {
		return navigation.getItemComponent(item) === 'button'
	}

	return {
		...navigation,
		...view,
		rootRef,
		isExpandInstant: computed(() => motion.isReduced.value || Boolean(props.isCollapsed)),
		getItemAriaControls: (item: SideBarItem, index: number) =>
			navigation.isDisclosureItem(item) && navigation.shouldRenderChildren(item) ? view.getChildrenId(index) : undefined,
		getItemComponent: (item: SideBarItem) => (view.hasFlyout(item) || isButton(item) ? 'button' : BaseLink),
		getItemProps: (item: SideBarItem) => {
			if (view.hasFlyout(item)) return { type: 'button' }
			const itemProps = navigation.getItemProps(item)
			if (isButton(item)) return itemProps
			return { ...itemProps, variant: 'ghost', hasExternalIcon: false, linkComponent: props.linkComponent }
		},
		tooltipPosition: computed(() => mirrorSide('right', isRtl.value)),
		getFlyoutProps: (item: SideBarItem) =>
			view.hasFlyout(item)
				? {
						items: view.getFlyoutItems(item),
						position: mirrorSide<DropdownPosition>('right-start', isRtl.value),
						ariaLabel: item.label,
					}
				: {},
	}
}
