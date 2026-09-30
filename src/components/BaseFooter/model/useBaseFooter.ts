import { computed, useSlots } from 'vue'
import type { BaseFooterProps } from '../types/BaseFooter.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseFooter(props: BaseFooterProps) {
	const slots = useSlots()
	const hasTop = computed(() => Boolean(slots.top) || Boolean(props.columns?.length))
	return {
		...useStandardBaseComponent('base-footer', props, ['root', 'inner']),
		slots,
		hasTop,
		hasBar: computed(() => Boolean(slots.start || slots.default || slots.end) || !hasTop.value),
	}
}
