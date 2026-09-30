import { useSideBarItemView } from './useSideBarItemView'
import { useSideBarNavigation } from '@composables/navigation/useSideBarNavigation'
import type { BaseSideBarNavigationEmits, BaseSideBarNavigationProps, SideBarItem } from '../types/BaseSideBar.types'

export function useBaseSideBarNavigation(props: BaseSideBarNavigationProps, emit: BaseSideBarNavigationEmits) {
	const navigation = useSideBarNavigation({ props, emit })
	const view = useSideBarItemView(props, (item: SideBarItem, event: Event) => {
		item.click?.(item, event as MouseEvent)
		emit('itemClick', item, event as MouseEvent)
	})

	return {
		...navigation,
		...view,
		getItemComponent: (item: SideBarItem) => (view.hasFlyout(item) ? 'button' : navigation.getItemComponent(item)),
		getItemProps: (item: SideBarItem) => (view.hasFlyout(item) ? { type: 'button' } : navigation.getItemProps(item)),
		getFlyoutProps: (item: SideBarItem) =>
			view.hasFlyout(item) ? { items: view.getFlyoutItems(item), position: 'right-start', ariaLabel: item.label } : {},
	}
}
