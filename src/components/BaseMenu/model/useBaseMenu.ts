import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseMenuEmits, BaseMenuItem, BaseMenuProps } from '../types/BaseMenu.types'

function isLink(item: BaseMenuItem): boolean {
	return Boolean(item.to || item.href)
}

function itemAttrs(item: BaseMenuItem, sizeScale: number | undefined): Record<string, unknown> {
	if (!isLink(item)) return { role: 'button', tabindex: 0, 'aria-disabled': item.isDisabled || undefined }
	return { to: item.to, href: item.href, target: item.target, variant: 'ghost', isDisabled: item.isDisabled, sizeScale }
}

export function useBaseMenu(props: BaseMenuProps, emit: BaseMenuEmits) {
	function handleItemClick(item: BaseMenuItem): void {
		if (item.isDisabled) return
		item.click?.()
		emit('select', item)
	}

	return {
		...useStandardBaseComponent('base-menu', props, ['root', 'group', 'item', 'icon', 'label', 'divider']),
		isLink,
		itemAttrs: (item: BaseMenuItem): Record<string, unknown> => itemAttrs(item, props.sizeScale),
		handleItemClick,
		handleItemKeydown(item: BaseMenuItem, event: KeyboardEvent): void {
			if (isLink(item) || (event.key !== 'Enter' && event.key !== ' ')) return
			event.preventDefault()
			handleItemClick(item)
		},
	}
}
