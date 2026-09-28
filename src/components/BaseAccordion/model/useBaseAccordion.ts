/** Composable: логика BaseAccordion — раскрытые пункты и id заголовков и панелей */
import { onMounted, ref, useId } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseAccordionEmits, BaseAccordionProps } from '../types/BaseAccordion.types'

const ACCORDION_ELEMENTS = ['root', 'item', 'header', 'icon', 'label', 'arrow', 'arrowIcon', 'collapse', 'content', 'contentText']

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
	// Префикс id экземпляра связывает заголовок и панель через aria-controls/aria-labelledby без коллизий между аккордеонами
	const baseId = useId()

	return {
		...useStandardBaseComponent('base-accordion', props, ACCORDION_ELEMENTS),
		...useOpenItems(props, emit),
		getHeaderId: (index: number): string => `${baseId}-header-${index}`,
		getPanelId: (index: number): string => `${baseId}-panel-${index}`,
	}
}
