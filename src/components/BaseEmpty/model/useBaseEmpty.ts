import { computed } from 'vue'
import type { BaseEmptyProps } from '../types/BaseEmpty.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

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
