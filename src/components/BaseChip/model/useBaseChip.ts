import { computed } from 'vue'
import type { BaseChipEmits, ChipProps } from '../types/BaseChip.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

function toNumber(content: ChipProps['content']): number | null {
	if (typeof content === 'number') return content
	const parsed = Number(content)
	return Number.isNaN(parsed) ? null : parsed
}

export function useBaseChip(props: ChipProps, emit: BaseChipEmits) {
	const numericValue = computed(() => toNumber(props.content))

	return {
		...useStandardBaseComponent('base-chip', props, ['root', 'badge']),
		isVisible: computed((): boolean => {
			if (props.content === undefined || props.content === '') return false
			return !(props.isHiddenOnZero && numericValue.value === 0)
		}),
		displayContent: computed((): string => {
			if (numericValue.value !== null && props.hasOverflow && numericValue.value > props.maxValue) return `${props.maxValue}+`
			return String(props.content)
		}),
		handleBadgeClick: () => emit('click-badge'),
	}
}
