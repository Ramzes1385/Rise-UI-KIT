/** Composable: логика BaseFooter — классы, стили и слоты */
import { useSlots } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseFooterProps } from '../types/BaseFooter.types'

export function useBaseFooter(props: BaseFooterProps) {
	return { ...useStandardBaseComponent('base-footer', props, ['root', 'inner']), slots: useSlots() }
}
