import { computed } from 'vue'
import { usePadding } from '@composables/base/usePadding'
import type { BaseCardProps } from '../types/BaseCard.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseCard(props: BaseCardProps) {
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad' })

	return {
		...useStandardBaseComponent('base-card', props, ['root', 'header', 'title', 'subtitle', 'actions', 'body', 'footer']),
		cardStyle: computed(() => ({
			...(props.padding === undefined ? undefined : paddingStyle.value),
			'--card-height': props.height || 'auto',
		})),
	}
}
