/** Composable: логика BaseFooter — классы, стили и слоты */
import { useSlots } from 'vue'
import type { BaseFooterProps } from '../types/BaseFooter.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

export function useBaseFooter(props: BaseFooterProps) {
	return { ...useStandardBaseComponent('base-footer', props, ['root', 'inner']), slots: useSlots() }
}
