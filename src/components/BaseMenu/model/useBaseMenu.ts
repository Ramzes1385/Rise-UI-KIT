import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseMenuEmits, BaseMenuItem, BaseMenuProps } from '../types/BaseMenu.types'

export function useBaseMenu(props: BaseMenuProps, emit: BaseMenuEmits) {
	return {
		...useStandardBaseComponent('base-menu', props, ['root', 'group', 'item', 'icon', 'label', 'divider']),
		handleItemClick(item: BaseMenuItem): void {
			if (item.isDisabled) return
			item.click?.()
			emit('select', item)
		},
	}
}
