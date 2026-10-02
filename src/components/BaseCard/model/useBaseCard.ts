import { computed, useId } from 'vue'
import { usePadding } from '@composables/base/usePadding'
import { useClickable } from '@composables/interaction/useClickable'
import type { BaseCardEmits, BaseCardProps } from '../types/BaseCard.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseCard(props: BaseCardProps, emit: BaseCardEmits) {
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad' })

	return {
		...useClickable({ event: 'click', isDisabled: () => Boolean(props.isDisabled) }),
		titleId: `rise-card-title-${useId()}`,
		handleClick: (event: MouseEvent) => {
			if (!props.isDisabled) emit('click', event)
		},
		...useStandardBaseComponent('base-card', props, ['root', 'header', 'title', 'subtitle', 'actions', 'body', 'footer']),
		cardStyle: computed(() => ({
			...(props.padding === undefined ? undefined : paddingStyle.value),
			'--card-height': props.height || 'auto',
		})),
	}
}
