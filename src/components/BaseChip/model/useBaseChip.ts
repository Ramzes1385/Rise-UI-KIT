import { formatMessage } from '@/locales'
import { computed, ref, watch } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useClickable } from '@composables/interaction/useClickable'
import type { BaseChipEmits, ChipProps } from '../types/BaseChip.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

function toNumber(content: ChipProps['content']): number | null {
	if (typeof content === 'number') return content
	const parsed = Number(content)
	return Number.isNaN(parsed) ? null : parsed
}

export function useBaseChip(props: ChipProps, emit: BaseChipEmits) {
	const numericValue = computed(() => toNumber(props.content))
	const clickable = useClickable({ event: 'click-badge' })
	const displayContent = computed((): string => {
		if (numericValue.value !== null && props.hasOverflow && numericValue.value > props.maxValue) return `${props.maxValue}+`
		return String(props.content)
	})
	const bump = ref<0 | 1 | null>(null)
	watch(displayContent, () => {
		bump.value = bump.value === 0 ? 1 : 0
	})

	return {
		isClickable: clickable.isClickable,
		...useStandardBaseComponent('base-chip', props, ['root', 'badge']),
		ui: useUi(props, 'base-chip'),
		isVisible: computed((): boolean => {
			if (props.content === undefined || props.content === '') return false
			return !(props.isHiddenOnZero && numericValue.value === 0)
		}),
		displayContent,
		bumpClass: computed(() => (bump.value === null ? undefined : `base-chip__badge--bump-${bump.value}`)),
		badgeLabel: computed(() =>
			clickable.isClickable.value ? formatMessage(UI_ARIA.CHIP_BADGE, { value: displayContent.value }) : undefined,
		),
		badgeListeners: computed(() => (clickable.isClickable.value ? { click: () => emit('click-badge') } : {})),
	}
}
