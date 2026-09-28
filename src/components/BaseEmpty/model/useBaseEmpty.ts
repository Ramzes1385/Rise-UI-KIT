/** Composable: логика BaseEmpty — классы, стили и иконка */
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseEmptyProps } from '../types/BaseEmpty.types'

export function useBaseEmpty(props: BaseEmptyProps) {
	return {
		...useStandardBaseComponent('base-empty', props, [
			'root',
			'iconWrapper',
			'icon',
			'content',
			'title',
			'description',
			'body',
			'actions',
		]),
		emptyIcon: computed((): string => props.icon || 'inbox'),
	}
}
