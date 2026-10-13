import { computed, useSlots } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { BaseEmptyProps } from '../types/BaseEmpty.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseEmpty(props: BaseEmptyProps) {
	const slots = useSlots()

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
		ui: useUi(props, 'base-empty'),
		emptyIcon: computed((): string => props.icon || 'inbox'),
		hasIcon: computed((): boolean => !props.isCompact || Boolean(props.icon) || Boolean(slots.icon)),
	}
}
