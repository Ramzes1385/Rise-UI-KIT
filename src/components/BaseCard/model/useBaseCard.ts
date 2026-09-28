/** Composable: логика BaseCard — классы, стили и отступы секций */
import { computed } from 'vue'
import { usePadding } from '@composables/usePadding'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseCardProps } from '../types/BaseCard.types'

export function useBaseCard(props: BaseCardProps) {
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--card-pad' })

	return {
		...useStandardBaseComponent('base-card', props, ['root', 'header', 'title', 'subtitle', 'actions', 'body', 'footer']),
		cardStyle: computed(() => ({
			// Без пропа padding отступы секций берутся из стилей (16px 20px), inline-переменные не пишутся
			...(props.padding === undefined ? undefined : paddingStyle.value),
			'--card-height': props.height || 'auto',
		})),
	}
}
