import { useClickable } from '@composables/interaction/useClickable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps } from '../types/BaseBadge.types'

export function useBaseBadge(props: BaseBadgeProps, emit: BaseBadgeEmits) {
	return {
		...useStandardBaseComponent('base-badge', props, ['root', 'text']),
		...useClickable({ listener: 'onClick', isDisabled: () => Boolean(props.isDisabled) }),
		handleClick: (event: MouseEvent) => {
			if (!props.isDisabled) emit('click', event)
		},
	}
}
