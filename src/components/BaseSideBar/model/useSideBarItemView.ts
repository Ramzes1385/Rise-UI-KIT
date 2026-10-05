import { useId } from 'vue'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'
import type { BaseSideBarNavigationProps, SideBarBadgeColor, SideBarItem, SideBarItemSelectHandler } from '../types/BaseSideBar.types'

function toMenuItems(items: SideBarItem[], onSelect: SideBarItemSelectHandler): DropdownMenuItem[] {
	return items.flatMap(item => {
		if (item.type === 'group') return [{ type: 'label', label: item.label }, ...toMenuItems(item.children ?? [], onSelect)]
		return [toMenuItem(item, onSelect)]
	})
}

function toMenuItem(item: SideBarItem, onSelect: SideBarItemSelectHandler): DropdownMenuItem {
	const hasChildren = Boolean(item.children?.length)
	return {
		label: item.label,
		icon: item.icon,
		to: typeof item.to === 'string' ? item.to : undefined,
		isDisabled: item.isDisabled,
		children: hasChildren ? toMenuItems(item.children!, onSelect) : undefined,
		onSelect: hasChildren ? undefined : (event: Event) => onSelect(item, event),
	}
}

export function useSideBarItemView(props: BaseSideBarNavigationProps, onSelect: SideBarItemSelectHandler) {
	const baseId = useId()

	function hasFlyout(item: SideBarItem): boolean {
		return Boolean(props.isCollapsed && !item.isDisabled && item.type !== 'group' && item.children?.length)
	}

	return {
		hasFlyout,
		isGroupItem: (item: SideBarItem): boolean => item.type === 'group',
		getGroupLabelId: (index: number): string => `${baseId}-group-${index}`,
		getChildrenId: (index: number): string => `${baseId}-children-${index}`,
		getBadgeColor: (item: SideBarItem): SideBarBadgeColor => item.badgeColor ?? 'neutral',
		getCollapsedLabel: (item: SideBarItem): string => (item.badge === undefined ? item.label : `${item.label}, ${item.badge}`),
		getFlyoutItems(item: SideBarItem): DropdownMenuItems {
			const children = toMenuItems(item.children ?? [], onSelect)
			if (!item.to) return [{ type: 'label', label: item.label }, ...children]
			return [[toMenuItem({ ...item, children: undefined }, onSelect)], children]
		},
	}
}
