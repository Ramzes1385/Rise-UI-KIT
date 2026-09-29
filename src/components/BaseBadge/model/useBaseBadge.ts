import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps } from '../types/BaseBadge.types'

export function useBaseBadge(props: BaseBadgeProps, emit: BaseBadgeEmits) {
	return {
		...useStandardBaseComponent('base-badge', props, ['root', 'text']),
		handleClick: (event: MouseEvent) => emit('click', event),
	}
}
