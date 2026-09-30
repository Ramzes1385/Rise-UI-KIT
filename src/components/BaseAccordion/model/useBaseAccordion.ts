import { computed, onMounted, ref, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseAccordionEmits, BaseAccordionProps } from '../types/BaseAccordion.types'

const ACCORDION_ELEMENTS = [
	'root',
	'item',
	'header',
	'icon',
	'label',
	'description',
	'arrow',
	'arrowIcon',
	'collapse',
	'content',
	'contentText',
]

const DEFAULT_EXPAND_ICON = 'chevron-down'

function useAccordionAppearance(props: BaseAccordionProps) {
	return {
		appearanceClass: computed((): string[] =>
			[
				props.showArrow === false ? '' : `base-accordion--arrow-${props.arrowPosition ?? 'end'}`,
				`base-accordion--density-${props.density ?? 'default'}`,
				props.divider ? `base-accordion--divider-${props.divider}` : '',
				props.collapseIcon ? 'base-accordion--icon-swap' : '',
				props.isAccented ? 'base-accordion--accented' : '',
			].filter(Boolean),
		),
		hasArrow: computed((): boolean => props.showArrow !== false),
		arrowIconName: (isItemOpen: boolean): string =>
			isItemOpen && props.collapseIcon ? props.collapseIcon : (props.expandIcon ?? DEFAULT_EXPAND_ICON),
	}
}

function useOpenItems(props: BaseAccordionProps, emit: BaseAccordionEmits) {
	const openIndexes = ref<number[]>([])
	onMounted(() => {
		props.items.forEach((item, index) => {
			if (item.defaultOpen) openIndexes.value.push(index)
		})
	})

	const open = (index: number): void => {
		openIndexes.value = props.isMultiple ? [...openIndexes.value, index] : [index]
		emit('toggle', index, true)
	}

	return {
		isOpen: (index: number): boolean => openIndexes.value.includes(index),
		toggleItem(index: number): void {
			if (props.items[index].isDisabled) return
			const position = openIndexes.value.indexOf(index)
			if (position === -1) {
				open(index)
				return
			}
			openIndexes.value.splice(position, 1)
			emit('toggle', index, false)
		},
	}
}

export function useBaseAccordion(props: BaseAccordionProps, emit: BaseAccordionEmits) {
	const baseId = useId()

	return {
		...useStandardBaseComponent('base-accordion', props, ACCORDION_ELEMENTS),
		...useOpenItems(props, emit),
		...useAccordionAppearance(props),
		getHeaderId: (index: number): string => `${baseId}-header-${index}`,
		getPanelId: (index: number): string => `${baseId}-panel-${index}`,
	}
}
